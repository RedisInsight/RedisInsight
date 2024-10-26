import { defineConfig } from 'vite';
import { builtinModules } from 'module';
import path from 'path';

export default defineConfig({
  plugins: [
    {
      name: 'resolve-api-imports',
      resolveId(source) {
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
    emptyOutDir: false,
    outDir: 'dist',
    lib: {
      entry: path.resolve(__dirname, 'index.ts'),
      formats: ['cjs'],  // Only use CJS format
      fileName: () => 'index.js',
    },
    rollupOptions: {
      external: [
        'electron',
        'ts-node',
        '@nestjs/core',
        '@nestjs/common',
        '@nestjs/platform-express',
        '@nestjs/swagger',
        'nest-winston',
        ...builtinModules,
        ...builtinModules.map(m => `node:${m}`),
        /^apiSrc\//,
        /^src\//,
      ],
      output: {
        format: 'cjs',
        entryFileNames: '[name].js',
      }
    },
    target: 'node14',
  },
  resolve: {
    alias: {
      desktopSrc: path.resolve(__dirname, 'src'),
      uiSrc: path.resolve(__dirname, '../ui/src'),
    },
  },
  optimizeDeps: {
    include: ['electron']
  }
});
