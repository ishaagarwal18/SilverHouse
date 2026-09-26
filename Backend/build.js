const fs = require('fs');
const path = require('path');
const { minify: minifyJs } = require('terser');
const { minify: minifyHtml } = require('html-minifier-terser');
const minifySql = require('pg-minify');
const CleanCSS = require('clean-css');
const { execSync } = require('child_process');

const backendDir = __dirname;
const distDir = path.join(backendDir, 'dist');
const zipPath = path.join(backendDir, 'silverhouse-backend-dist.zip');

const cleanCssInstance = new CleanCSS({
    level: 2, // Applies advanced optimizations including merging selectors and properties
    compatibility: '*'
});

async function processFileOrDir(src, dest) {
    const stats = fs.statSync(src);

    if (stats.isDirectory()) {
        fs.mkdirSync(dest, { recursive: true });
        for (const child of fs.readdirSync(src)) {
            await processFileOrDir(path.join(src, child), path.join(dest, child));
        }
        return;
    }

    fs.mkdirSync(path.dirname(dest), { recursive: true });
    const ext = path.extname(src).toLowerCase();

    // 1. Minify JavaScript
    if (ext === '.js') {
        const rawCode = fs.readFileSync(src, 'utf8');
        try {
            const minified = await minifyJs(rawCode, {
                compress: {
                    drop_console: false,
                    drop_debugger: true,
                },
                mangle: true,
                ecma: 2020,
            });

            fs.writeFileSync(dest, minified.code || rawCode, 'utf8');
            console.log(`  ⚡ Minified JS:   ${path.relative(backendDir, src)}`);
        } catch (err) {
            console.warn(`  ⚠️ JS minify failed for ${src}, copying unminified: ${err.message}`);
            fs.copyFileSync(src, dest);
        }
    } 
    // 2. Minify HTML
    else if (ext === '.html' || ext === '.htm') {
        const rawHtml = fs.readFileSync(src, 'utf8');
        try {
            const minified = await minifyHtml(rawHtml, {
                collapseWhitespace: true,
                removeComments: true,
                removeRedundantAttributes: true,
                removeScriptTypeAttributes: true,
                removeStyleLinkTypeAttributes: true,
                useShortDoctype: true,
                minifyJS: true,
                minifyCSS: true
            });

            fs.writeFileSync(dest, minified, 'utf8');
            console.log(`  ⚡ Minified HTML: ${path.relative(backendDir, src)}`);
        } catch (err) {
            console.warn(`  ⚠️ HTML minify failed for ${src}, copying unminified: ${err.message}`);
            fs.copyFileSync(src, dest);
        }
    } 
    // 3. Minify SQL
    else if (ext === '.sql') {
        const rawSql = fs.readFileSync(src, 'utf8');
        try {
            const minified = minifySql(rawSql, { compress: true });
            fs.writeFileSync(dest, minified, 'utf8');
            console.log(`  ⚡ Minified SQL:  ${path.relative(backendDir, src)}`);
        } catch (err) {
            console.warn(`  ⚠️ SQL minify failed for ${src}, copying unminified: ${err.message}`);
            fs.copyFileSync(src, dest);
        }
    }
    // 4. Minify CSS
    else if (ext === '.css') {
        const rawCss = fs.readFileSync(src, 'utf8');
        try {
            const output = cleanCssInstance.minify(rawCss);
            if (output.errors.length > 0) {
                throw new Error(output.errors.join(', '));
            }
            fs.writeFileSync(dest, output.styles, 'utf8');
            console.log(`  ⚡ Minified CSS:  ${path.relative(backendDir, src)}`);
        } catch (err) {
            console.warn(`  ⚠️ CSS minify failed for ${src}, copying unminified: ${err.message}`);
            fs.copyFileSync(src, dest);
        }
    }
    // 5. Copy all other assets as-is
    else {
        fs.copyFileSync(src, dest);
    }
}

async function build() {
    console.log('🚀 Starting Backend Production Build & Distribution Packaging...');

    // 1. Clean previous dist and zip
    if (fs.existsSync(distDir)) {
        fs.rmSync(distDir, { recursive: true, force: true });
    }
    if (fs.existsSync(zipPath)) {
        fs.unlinkSync(zipPath);
    }

    fs.mkdirSync(distDir, { recursive: true });

    // 2. Files and directories to process
    const itemsToCopy = [
        'server.js',
        'db.js',
        'package.json',
        'package-lock.json',
        'public',
        'Files'
    ];

    for (const item of itemsToCopy) {
        const srcPath = path.join(backendDir, item);
        const destPath = path.join(distDir, item);
        if (fs.existsSync(srcPath)) {
            console.log(`  ✓ Processing ${item}`);
            await processFileOrDir(srcPath, destPath);
        }
    }

    // 3. Create a production-ready .env.example inside dist
    const envExampleContent = `# SilverHouse Backend Configuration
PORT=5000
NODE_ENV=production

# Database Configuration (MSSQL Server)
DB_SERVER=YOUR_DB_SERVER
DB_NAME=SilverHouse
DB_USER=YOUR_DB_USER
DB_PASSWORD=YOUR_DB_PASSWORD
DB_PORT=1433
DB_ENCRYPT=true
DB_TRUST_SERVER_CERT=true
`;
    fs.writeFileSync(path.join(distDir, '.env.example'), envExampleContent, 'utf8');
    console.log('  ✓ Generated .env.example');

    // 4. Create README inside dist
    const readmeContent = `# SilverHouse Backend (Production Distribution)

## Prerequisites
- Node.js (v18+ recommended)
- Microsoft SQL Server (Local Express, Azure SQL, or Railway MSSQL)

## Getting Started
1. Install dependencies:
   \`\`\`bash
   npm install --omit=optional
   \`\`\`

2. Configure environment:
   - Copy \`.env.example\` to \`.env\`
   - Set your database credentials in \`.env\`

3. Initialize SQL Database:
   - Execute the SQL scripts in the \`Files/\` directory on your SQL Server.

4. Start the server:
   \`\`\`bash
   npm start
   \`\`\`
   - Server API: http://localhost:5000/api/data
   - Product Catalog: http://localhost:5000/catalog
`;
    fs.writeFileSync(path.join(distDir, 'README.md'), readmeContent, 'utf8');
    console.log('  ✓ Generated README.md');

    // 5. Create ZIP file using native PowerShell Compress-Archive
    console.log('📦 Compressing dist/ into silverhouse-backend-dist.zip...');
    try {
        execSync(`powershell -NoProfile -Command "Compress-Archive -Path '${distDir}\\*' -DestinationPath '${zipPath}' -Force"`, {
            stdio: 'inherit'
        });
        const zipStats = fs.statSync(zipPath);
        const sizeMb = (zipStats.size / (1024 * 1024)).toFixed(2);
        console.log(`\n🎉 SUCCESS! Distribution zip created:`);
        console.log(`   Location: ${zipPath}`);
        console.log(`   Size: ${sizeMb} MB (Clean, compact, and ready for email attachment!)`);
    } catch (err) {
        console.error('Failed to create zip file:', err.message);
    }
}

build();