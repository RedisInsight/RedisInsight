import { defineConfig } from 'vite'
import { builtinModules } from 'module'
import path from 'path'

export default defineConfig({
  plugins: [
    {
      name: 'resolve-imports',
      enforce: 'pre',
      resolveId(source) {
        if (source.startsWith('apiSrc/')) {
          // Keep the full module path but point to dist
          const relativePath = source.replace('apiSrc/', '')
          const fullPath = path.join(__dirname, '../api/dist/src', relativePath)
          return {
            id: fullPath,
            external: true
          }
        }
        return null
      }
    }
  ],
  build: {
    emptyOutDir: false,
    outDir: 'dist',
    lib: {
      entry: path.resolve(__dirname, 'index.ts'),
      formats: ['cjs'],
      fileName: () => 'index.js',
    },
    rollupOptions: {
      external: [
        'electron',
        'ts-node',
        ...builtinModules,
        ...builtinModules.map((m) => `node:${m}`),
        /^@nestjs\/.*/,
        /^src\//,
        /^\.\.\/api\/dist\/src\/.*/
      ],
      output: {
        format: 'cjs',
        entryFileNames: '[name].js',
        interop: 'auto'
      }
    }
  },
  resolve: {
    alias: {
      desktopSrc: path.resolve(__dirname, 'src'),
      uiSrc: path.resolve(__dirname, '../ui/src')
    }
  }
})
