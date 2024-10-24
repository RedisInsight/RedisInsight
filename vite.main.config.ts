import { defineConfig } from 'vite';
import { builtinModules } from 'module';
import path from 'path';

export default defineConfig({
  plugins: [
    {
      name: 'resolve-api-imports',
      resolveId: (source) => {
        if (source.startsWith('apiSrc/') || source.startsWith('src/')) {
          return {
            id: source,
            external: true
          };
        }
      },
    },
  ],
  build: {
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
        ...builtinModules.map(m => `node:${m}`),
        /^apiSrc\//,
        /^src\//,
      ],
      output: {
        entryFileNames: '[name].js',
        format: 'cjs',
        exports: 'named',
      },
    },
    emptyOutDir: true,
    target: 'node14',
  },
  resolve: {
    alias: {
      desktopSrc: path.resolve(__dirname, 'src'),
      uiSrc: path.resolve(__dirname, '../ui/src'),
    },
  },
  define: {
    'process.env.ELECTRON_DEV': JSON.stringify(process.env.ELECTRON_DEV),
  },
});
