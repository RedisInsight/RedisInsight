import { defineConfig } from 'vite'
import { transform } from 'esbuild'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import { ViteEjsPlugin } from 'vite-plugin-ejs'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { resolve } from 'path'

const riPlugins = [
  { name: 'redisearch', entry: 'src/main.tsx' },
  { name: 'clients-list', entry: 'src/main.tsx' },
  { name: 'redisgraph', entry: 'src/main.tsx' },
  { name: 'redistimeseries-app', entry: 'src/main.tsx' },
  { name: 'ri-explain', entry: 'src/main.tsx' },
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
      targets: riPlugins.map(({ name: pluginDir }) => ({
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
        riPlugins.map(({ name: pluginDir, entry }) => [pluginDir, resolve(__dirname, `./${pluginDir}/${entry}`)])
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
