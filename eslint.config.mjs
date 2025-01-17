import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import stylistic from '@stylistic/eslint-plugin';
import eslintConfigPrettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';

const ignored = {
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
};

const rules = {
  rules: {
    '@stylistic/indent': ['error', 2],
    '@stylistic/no-multiple-empty-lines': ['error'],
    quotes: [
      2,
      'single',
      {
        avoidEscape: true,
      },
    ],
    'max-len': [
      'error',
      {
        ignoreComments: true,
        ignoreStrings: true,
        ignoreRegExpLiterals: true,
        code: 120,
      },
    ],
    'class-methods-use-this': 'off',
    'import/no-extraneous-dependencies': 'off',
    semi: ['error', 'never'],
    'object-curly-newline': 'off',
    'import/prefer-default-export': 'off',
    'comma-dangle': 'off',
    'import/order': [
      1,
      {
        groups: [
          'external',
          'builtin',
          'internal',
          'sibling',
          'parent',
          'index',
        ],
        pathGroups: [
          {
            pattern: 'desktopSrc/**',
            group: 'internal',
            position: 'after',
          },
          {
            pattern: 'uiSrc/**',
            group: 'internal',
            position: 'after',
          },
          {
            pattern: 'apiSrc/**',
            group: 'internal',
            position: 'after',
          },
        ],
        warnOnUnassignedImports: true,
        pathGroupsExcludedImportTypes: ['builtin'],
      },
    ],
  },
};

/** @type {import('eslint').Linter.Config[]} */
export default [
  eslintConfigPrettier,
  importPlugin.flatConfigs.recommended,
  ignored,
  {
    plugins: {
      '@stylistic': stylistic,
    },
  },
  rules,
  { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'] },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ...pluginReact.configs.flat.recommended,
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  pluginReact.configs.flat['jsx-runtime'],
  {
    files: ['**/*.ts', '**/*.tsx'],

    rules: {
      semi: 'off',
    },
  },
  {
    files: ['**/*.js', '**/*.jsx', '**/*.cjs', '**/*.mjs'],

    rules: {
      semi: ['error', 'always'],
    },
  },
];
