import { defineConfig } from 'vite'
import { transform } from 'esbuild'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import { ViteEjsPlugin } from 'vite-plugin-ejs'
import { resolve } from 'path'

/**
 * @type {import('vite').UserConfig}
 */
export default defineConfig({
  plugins: [
    react(),
    svgr({ include: ['**/*.svg?react'] }),
    ViteEjsPlugin(),
    minifyEs(),
  ],
  resolve: {
    alias: {
      lodash: 'lodash-es',
      '@elastic/eui$': '@elastic/eui/optimize/lib',
    },
  },
  server: {
    port: 8080,
    fs: {
      allow: [
        '..',
      ],
    },
  },
  envPrefix: 'RI_',
  build: {
    lib: {
      entry: resolve(__dirname, 'index.tsx'),
      formats: ['esm'],
    },
    rollupOptions: {
      output: {
        entryFileNames: 'index.js',
        assetFileNames: 'index.css',
        manualChunks: undefined,
      }
    },
    outDir: './dist',
    target: 'es2022',
    minify: 'esbuild',

    define: {
      this: 'window',
    },
  },
  define: {
    global: 'globalThis',
    'process.env': {},
  },
})

function minifyEs() {
  return {
    name: 'minifyEs',
    renderChunk: {
      order: 'post',
      async handler(code, chunk, outputOptions) {
        if (outputOptions.format === 'es' && chunk.fileName.endsWith('.js')) {
          return transform(code, { minify: true })
        }
        return code
      },
    }
  }
}
