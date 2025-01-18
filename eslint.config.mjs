import globals from 'globals';
import pluginJs from '@eslint/js';
import { configs } from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import stylistic from '@stylistic/eslint-plugin';
import eslintConfigPrettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import eslintPluginImportX from 'eslint-plugin-import-x';
import tsParser from '@typescript-eslint/parser';
import path from 'path';

const ignored = [
  '**/logs',
  '**/*.log',
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
  'report',
  '**/__mocks__',
  'tests/e2e',
  'redisinsight/ui/src/packages/redisgraph',
  'redisinsight/ui/src/packages/redistimeseries-app',
  'redisinsight/api/test/test-runs/coverage',
];

const rules = {
  '@stylistic/indent': ['error', 2],
  '@stylistic/no-multiple-empty-lines': ['error'],
  quotes: ['error', 'single', { avoidEscape: true }],
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
  '@typescript-eslint/no-unused-vars': [
    'error',
    {
      args: 'all',
      argsIgnorePattern: '^_',
      caughtErrors: 'all',
      caughtErrorsIgnorePattern: '^_',
      destructuredArrayIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      ignoreRestSiblings: true,
    },
  ],
  'no-undef': 'error',
  'import/order': [
    'warn',
    {
      groups: ['external', 'builtin', 'internal', 'parent', 'sibling', 'index'],
      pathGroups: [
        { pattern: 'desktopSrc/**', group: 'internal', position: 'after' },
        { pattern: 'uiSrc/**', group: 'internal', position: 'after' },
        { pattern: 'apiSrc/**', group: 'internal', position: 'after' },
      ],
      warnOnUnassignedImports: true,
      pathGroupsExcludedImportTypes: ['builtin'],
    },
  ],
};

const resolverSettings = {
  settings: {
    'import/resolver': {
      typescript: {
        project: path.resolve('./tsconfig.json'),
      },
    },
  },
};

const languageOptions = {
  ecmaVersion: 'latest',
  sourceType: 'module',
  parser: tsParser,
  globals: { ...globals.browser, ...globals.node },
};

const fileSpecificConfigs = [
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: { semi: 'off' },
  },
  {
    files: ['**/*.js', '**/*.jsx', '**/*.cjs', '**/*.mjs'],
    rules: { semi: ['error', 'always'] },
  },
];

export default [
  { ignores: ignored },
  eslintConfigPrettier,
  importPlugin.flatConfigs.recommended,
  eslintPluginImportX.flatConfigs.recommended,
  eslintPluginImportX.flatConfigs.typescript,
  { plugins: { '@stylistic': stylistic }, ...resolverSettings },
  { rules },
  { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'], languageOptions },
  pluginJs.configs.recommended,
  {
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  ...fileSpecificConfigs,
  ...configs.recommended,
  pluginReact.configs.flat.recommended,
  pluginReact.configs.flat['jsx-runtime'],
];
