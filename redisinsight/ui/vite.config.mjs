import 'dotenv/config'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import fixReactVirtualized from 'esbuild-plugin-react-virtualized'
import { reactClickToComponent } from 'vite-plugin-react-click-to-component'
// import { compression } from 'vite-plugin-compression2'
import { fileURLToPath, URL } from 'url'
import path from 'path'
import { defaultConfig } from './src/config/default'

const isHostedApi = !!defaultConfig.api.hostedBaseUrl
const isElectron = defaultConfig.app.type === 'electron'
// set path to index.tsx in the index.html
process.env.RI_INDEX_NAME = isElectron ? 'indexElectron.tsx' : 'index.tsx'
const outDir = isElectron ? '../dist/renderer' : './dist'

let base
if (isHostedApi) {
  base = '/'
} else {
  base = defaultConfig.app.env === 'development' ? '/' : (isElectron ? '' : '/__RIPROXYPATH__')
}

/**
 * @type {import('vite').UserConfig}
 */
export default defineConfig({
  base,
  plugins: [
    react(),
    svgr({ include: ['**/*.svg?react'] }),
    reactClickToComponent(),
    // !isElectron && compression({
    //   include: [/\.(js)$/, /\.(css)$/],
    //   deleteOriginalAssets: true
    // }),
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
    fs: {
      allow: [
        '..',
        '../../node_modules/monaco-editor',
      ],
    },
  },
  envPrefix: 'RI_',
  optimizeDeps: {
    include: [
      'monaco-editor',
      'monaco-yaml/yaml.worker',
    ],
    esbuildOptions: {
      // fix for https://github.com/bvaughn/react-virtualized/issues/1722
      plugins: [fixReactVirtualized],
    },
  },
  build: {
    commonjsOptions: {
      exclude: ['./packages'],
    },
    outDir,
    target: 'es2020',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        // TODO chunks
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor'
          }
          return 'index'
        },
      },
    },
    define: {
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
    'process.env': {},
    'window.riConfig': {
      ...defaultConfig,
    }
  },
  // hack: apply proxy path to monaco webworker
  experimental: {
    renderBuiltUrl() {
      return { relative: true }
    },
  }
})
