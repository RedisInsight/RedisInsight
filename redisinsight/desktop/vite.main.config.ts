import { defineConfig } from 'vite'
import { builtinModules } from 'module'
import path from 'path'
import type { Plugin } from 'vite'

export default defineConfig({
  plugins: [
    {
      name: 'resolve-imports',
      enforce: 'pre',
      resolveId(source) {
        if (source.startsWith('desktopSrc/')) {
          const relativePath = source.replace('desktopSrc/', './src/')
          return relativePath
        }
        if (source.startsWith('uiSrc/')) {
          const relativePath = source.replace('uiSrc/', './ui/src/')
          return path.resolve(__dirname, relativePath)
        }
        if (source.startsWith('apiSrc/')) {
          if (process.env.NODE_ENV === 'development') {
            return {
              id: source.replace('apiSrc/', '../api/src/'),
              external: true
            }
          }
          return {
            id: source.replace('apiSrc/', '../api/dist/src/'),
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
        /^apiSrc\//
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
