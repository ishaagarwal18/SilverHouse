const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const backendDir = __dirname;
const distDir = path.join(backendDir, 'dist');
const zipPath = path.join(backendDir, 'silverhouse-backend-dist.zip');

console.log('🚀 Starting Backend Production Build & Distribution Packaging...');

// 1. Clean previous dist and zip
if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
}
if (fs.existsSync(zipPath)) {
    fs.unlinkSync(zipPath);
}

fs.mkdirSync(distDir, { recursive: true });

// 2. Files and directories to include in the distribution
const itemsToCopy = [
    'server.js',
    'db.js',
    'package.json',
    'package-lock.json',
    'public',
    'Files'
];

function copyRecursive(src, dest) {
    const stats = fs.statSync(src);
    if (stats.isDirectory()) {
        fs.mkdirSync(dest, { recursive: true });
        for (const child of fs.readdirSync(src)) {
            copyRecursive(path.join(src, child), path.join(dest, child));
        }
    } else {
        fs.copyFileSync(src, dest);
    }
}

for (const item of itemsToCopy) {
    const srcPath = path.join(backendDir, item);
    const destPath = path.join(distDir, item);
    if (fs.existsSync(srcPath)) {
        console.log(`  ✓ Copying ${item} to dist/`);
        copyRecursive(srcPath, destPath);
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

// 4. Create a quick README inside dist for your senior
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
