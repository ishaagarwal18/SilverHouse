import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { readFileSync } from 'node:fs'

/** Collects a package plus its transitive npm dependencies. */
function dependencyTree(roots, seen = new Set()) {
  for (const name of roots) {
    if (seen.has(name)) continue
    seen.add(name)
    try {
      const pkg = JSON.parse(readFileSync(new URL(`./node_modules/${name}/package.json`, import.meta.url)))
      dependencyTree(Object.keys(pkg.dependencies || {}), seen)
    } catch { /* optional or missing dependency */ }
  }
  return seen
}

// Packages used only by the lazy-loaded Admin Studio (charts, Excel/Word import) — kept out of the shared vendor chunk
const storefrontPackages = dependencyTree(['react', 'react-dom', 'react-router-dom', 'lucide-react'])
const adminOnlyPackages = [...dependencyTree(['chart.js', 'xlsx', 'mammoth'])].filter(name => !storefrontPackages.has(name))
function packageNameOf(id) {
  const parts = id.split(/node_modules[\\/]/).pop().split(/[\\/]/)
  return parts[0].startsWith('@') ? `${parts[0]}/${parts[1]}` : parts[0]
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  build: {
    outDir: 'build',
    emptyOutDir: true,
    minify: "esbuild",
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Admin-only libraries stay with their lazy-loaded admin chunks so storefront visitors never download them
            if (adminOnlyPackages.includes(packageNameOf(id))) {
              return undefined;
            }
            // Group specific heavy libraries into dedicated chunks
            if (id.includes('@mui') || id.includes('lucide-react')) {
              return 'ui-vendor';
            }
            if (id.includes('lodash') || id.includes('axios')) {
              return 'utils-vendor';
            }
            // Fallback for all other vendor libraries
            return 'vendor';
          }
        },
      },
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      },
      '/product_image': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      },
      '/docs': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})