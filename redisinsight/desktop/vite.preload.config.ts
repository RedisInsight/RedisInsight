import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  build: {
    outDir: '../desktop/dist',
    lib: {
      entry: path.join(__dirname, '../desktop/preload.ts'),
      formats: ['cjs'],
      fileName: () => 'preload.js',
    },
    rollupOptions: {
      external: ['electron'],
    },
    emptyOutDir: false,
  },
  resolve: {
    alias: {
      desktopSrc: path.resolve(__dirname, 'src'),
      uiSrc: path.resolve(__dirname, '../ui/src'),
    },
  },
})