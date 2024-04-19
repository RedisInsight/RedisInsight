import { defineConfig, splitVendorChunkPlugin } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import monacoEditorPlugin from 'vite-plugin-monaco-editor'
import fixReactVirtualized from 'esbuild-plugin-react-virtualized'
import { fileURLToPath, URL } from 'node:url'
import path from 'path'

/**
 * @type {import('vite').UserConfig}
 */
export default defineConfig({
  plugins: [
    react(),
    svgr({ include: ['**/*.svg?react'] }),
    monacoEditorPlugin.default({
      languages: ['json', 'javascript', 'typescript'],
      features: ['!rename'],
    }),
    splitVendorChunkPlugin(),
  ],
  resolve: {
    alias: {
      lodash: 'lodash-es',
      '@elastic/eui$': '@elastic/eui/optimize/lib',
      uiSrc: fileURLToPath(new URL('./src', import.meta.url)),
      apiSrc: fileURLToPath(new URL('../api/src', import.meta.url)),
    },
  },
  server: {
    port: 8080,
  },
  envPrefix: 'RI_',
  optimizeDeps: {
    esbuildOptions: {
      plugins: [fixReactVirtualized],
    },
  },
  build: {
    commonjsOptions: {
      exclude: ['./packages'],
    },
    outDir: './dist',
    target: 'es2020',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        // TODO chunks
        // manualChunks(id) {
        //   if (id.includes('react')) {
        //     return 'react'
        //   }
        //   if (id.includes('elastic')) {
        //     return 'elastic'
        //   }
        //   if (id.includes('lodash')) {
        //     return 'lodash'
        //   }
        //   if (id.includes('monaco')) {
        //     return 'monaco'
        //   }
        //   return 'index'
        // },
      },
    },
    define: {
      'window.app.config.apiPort': '5540',
      this: 'window',
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // add @layer app for css ordering. Styles without layer have the highest priority
        // https://github.com/vitejs/vite/issues/3924
        additionalData: (source, filename) => {
          if (path.extname(filename) === '.scss') {
            const skipFiles = ['/main.scss', '/App.scss']
            if (skipFiles.every((file) => !filename.endsWith(file))) {
              return `
                @use "uiSrc/styles/mixins/_eui.scss";
                @use "uiSrc/styles/mixins/_global.scss";
                @layer app { ${source} }
              `
            }
          }
          return source
        },
      },
    },
  },
  define: {
    global: 'globalThis',
    'window.app.config.apiPort': '5540',
    'process.env': {
      RI_NODE_ENV: 'development',
      RI_APP_TYPE: 'web',
      RI_API_PREFIX: 'api',
      RI_BASE_API_URL: 'http://localhost',
      RI_RESOURCES_BASE_URL: 'http://localhost',
      RI_PIPELINE_COUNT_DEFAULT: '5',
      RI_SCAN_COUNT_DEFAULT: '500',
      RI_SCAN_TREE_COUNT_DEFAULT: '10000',
      RI_CONNECTIONS_TIMEOUT_DEFAULT: 30 * 1000,
    },
    // 'process.env.NODE_ENV': isProduction ? 'production' : undefined,
  },
})
