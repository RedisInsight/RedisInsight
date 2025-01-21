import 'dotenv/config'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import fixReactVirtualized from 'esbuild-plugin-react-virtualized'
import { reactClickToComponent } from 'vite-plugin-react-click-to-component'
import { ViteEjsPlugin } from 'vite-plugin-ejs'
// import { compression } from 'vite-plugin-compression2'
import { fileURLToPath, URL } from 'url'
import path from 'path'
import { defaultConfig } from './src/config/default'

const isElectron = defaultConfig.app.type === 'electron'
// set path to index.tsx in the index.html
process.env.RI_INDEX_NAME = isElectron ? 'indexElectron.tsx' : 'index.tsx'
const outDir = isElectron ? '../dist/renderer' : './dist'

let base
if (defaultConfig.api.hostedBase) {
  base = defaultConfig.api.hostedBase
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
    ViteEjsPlugin(),
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
        'static',
        'defaults'
      ],
    },
  },
  envPrefix: 'RI_',
  optimizeDeps: {
    include: [
      'monaco-editor',
      'monaco-yaml/yaml.worker',
    ],
    exclude: [
      'react-json-tree',
      'redisinsight-plugin-sdk',
      'plotly.js-dist-min',
      '@antv/x6',
      '@antv/x6-react-shape',
      '@antv/hierarchy'
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
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return id.toString().split('node_modules/')[1].split('/')[0].toString()
          }

          if (id.includes('ui/src/assets')) {
            return 'assets'
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
    riConfig: defaultConfig,
  },
  // hack: apply proxy path to monaco webworker
  experimental: {
    renderBuiltUrl() {
      return { relative: true }
    },
  }
})
