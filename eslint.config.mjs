import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import eslintConfigPrettier from 'eslint-config-prettier';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: [
      'redisinsight/ui',
      'redisinsight/api',
      'redisinsight/api',
      'tests/e2e',
      '**/logs',
      '**/*.log',
      'redisinsight/api/test/test-runs/coverage',
      '**/pids',
      '**/*.pid',
      '**/*.seed',
      '**/lib-cov',
      '**/coverage',
      '**/.grunt',
      '**/.lock-wscript',
      'build/Release',
      '**/.eslintcache',
      '**/node_modules',
      '**/.DS_Store',
      '**/release',
      '**/*.main.prod.js',
      '**/*.renderer.prod.js',
      '**/scripts',
      '**/configs',
      '**/dist',
      '**/dll',
      '**/*.main.js',
      '**/.idea',
      '**/npm-debug.log.*',
      '**/__snapshots__',
      '**/package.json',
      '**/.travis.yml',
      '**/*.css.d.ts',
      '**/*.sass.d.ts',
      '**/*.scss.d.ts',
      'redisinsight/ui/src/packages/redisgraph',
      'redisinsight/ui/src/packages/redistimeseries-app',
      'report',
      '**/__mocks__',
    ],
  },
  { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'] },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  eslintConfigPrettier,
];
