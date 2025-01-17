import { defineConfig } from 'vite'
import { transform } from 'esbuild'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import { ViteEjsPlugin } from 'vite-plugin-ejs'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { resolve } from 'path'

const pluginsDir = [
  'redisearch',
  'clients-list',
  'redisgraph',
  'redistimeseries-app',
  'ri-explain',
]

/**
 * @type {import('vite').UserConfig}
 */
export default defineConfig({
  plugins: [
    react(),
    svgr({ include: ['**/*.svg?react'] }),
    ViteEjsPlugin(),
    minifyEs(),
    // Copy public static for all plugins
    viteStaticCopy({
      silent: true,
      targets: pluginsDir.map((pluginDir) => ({
        src: `./${pluginDir}/public/*`,
        dest: `./${pluginDir}/dist/`,
      }))
    }),
  ],
  resolve: {
    alias: {
      lodash: 'lodash-es',
      '@elastic/eui$': '@elastic/eui/optimize/lib',
    },
  },
  server: {
    port: 8081,
    fs: {
      allow: [
        '..',
      ],
    },
  },
  envPrefix: 'RI_',
  build: {
    outDir: './',
    cssCodeSplit: true,
    lib: {
      // Multi entries
      entry: Object.fromEntries(
        pluginsDir.map((pluginDir) => [pluginDir, resolve(__dirname, `./${pluginDir}/src/main.tsx`)])
      ),
    },

    rollupOptions: {
      output: [
        {
          dir: './',
          format: 'esm',
          entryFileNames: '[name]/dist/index.js',
          assetFileNames: '[name]/dist/styles.css',
          chunkFileNames: 'common/index.js',
        },
      ],
    },
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
