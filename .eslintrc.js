const path = require('path');

module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
  },
  extends: ['airbnb-typescript', 'prettier'],
  plugins: ['@typescript-eslint'],
  parser: '@typescript-eslint/parser',
  rules: {
    quotes: [2, 'single', { avoidEscape: true }],
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
    'import/no-extraneous-dependencies': 'off', // temporary disabled
    'object-curly-newline': 'off',
    'import/prefer-default-export': 'off',
    '@typescript-eslint/comma-dangle': 'off',
    'implicit-arrow-linebreak': 'off',
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
  overrides: [
    // Backend/API specific rules
    {
      files: ['redisinsight/api/**/*.ts', 'redisinsight/api/**/*.js'],
      env: {
        node: true,
        browser: false,
      },
      extends: [
        'airbnb-typescript/base',
        'plugin:sonarjs/recommended',
        'prettier',
      ],
      plugins: ['@typescript-eslint', 'sonarjs'],
      rules: {
        'max-len': ['warn', 120],
        '@typescript-eslint/return-await': 'off',
        '@typescript-eslint/dot-notation': 'off',
        'import/prefer-default-export': 'off',
        'max-classes-per-file': 'off',
        'class-methods-use-this': 'off',
        'no-await-in-loop': 'off',
        'import/no-extraneous-dependencies': 'off',
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
          },
        ],
      },
      parserOptions: {
        project: path.join(__dirname, 'redisinsight/api/tsconfig.json'),
      },
    },
    // Backend test files
    {
      files: [
        'redisinsight/api/**/*.spec.ts',
        'redisinsight/api/**/__mocks__/**/*',
      ],
      rules: {
        'sonarjs/no-duplicate-string': 0,
        'sonarjs/no-identical-functions': 0,
        'import/first': 0,
      },
    },
    // NestJS module files - more lenient with unused vars due to decorator usage
    // TODO: Probably fixable after update of deps
    // https://github.com/nestjs/nest-cli/issues/1750
    {
      files: [
        'redisinsight/api/**/*.module.ts',
        'redisinsight/api/**/app.module.ts',
      ],
      rules: {
        '@typescript-eslint/no-unused-vars': 'off',
      },
    },
    // Frontend/UI specific rules
    {
      files: [
        'redisinsight/ui/**/*.ts',
        'redisinsight/ui/**/*.tsx',
        'redisinsight/ui/**/*.js',
        'redisinsight/ui/**/*.jsx',
      ],
      env: {
        browser: true,
        node: false,
      },
      extends: [
        'airbnb-typescript',
        'airbnb/hooks',
        'plugin:sonarjs/recommended',
        'prettier',
      ],
      plugins: ['@typescript-eslint'],
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        project: path.join(__dirname, 'tsconfig.json'),
        createDefaultProgram: true,
      },
      rules: {
        radix: 'off',
        'no-bitwise': ['error', { allow: ['|'] }],
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
        'import/prefer-default-export': 'off',
        'import/no-cycle': 'off',
        'import/no-named-as-default-member': 'off',
        'no-plusplus': 'off',
        'no-return-await': 'off',
        'no-underscore-dangle': 'off',
        'no-useless-catch': 'off',
        'no-console': ['error', { allow: ['warn', 'error'] }],
        'jsx-a11y/anchor-is-valid': 'off',
        'jsx-a11y/no-access-key': 'off',
        'max-classes-per-file': 'off',
        'no-case-declarations': 'off',
        'react-hooks/exhaustive-deps': 'off',
        'react/jsx-props-no-spreading': 'off',
        'react/require-default-props': 'off',
        'react/prop-types': 1,
        'react/jsx-one-expression-per-line': 'off',
        '@typescript-eslint/comma-dangle': 'off',
        '@typescript-eslint/no-shadow': 'off',
        '@typescript-eslint/no-unused-expressions': 'off',
        '@typescript-eslint/no-use-before-define': 'off',
        'implicit-arrow-linebreak': 'off',
        'object-curly-newline': 'off',
        'no-nested-ternary': 'off',
        'no-param-reassign': ['error', { props: false }],
        'sonarjs/no-duplicate-string': 'off',
        'sonarjs/cognitive-complexity': [1, 20],
        'sonarjs/no-identical-functions': [0, 5],
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
                pattern: 'uiSrc/**',
                group: 'internal',
                position: 'after',
              },
              {
                pattern: 'apiSrc/**',
                group: 'internal',
                position: 'after',
              },
              {
                pattern: '{.,..}/*.scss',
                group: 'object',
                position: 'after',
              },
            ],
            warnOnUnassignedImports: true,
            pathGroupsExcludedImportTypes: ['builtin'],
          },
        ],
      },
    },
    // UI test files
    {
      files: ['redisinsight/ui/**/*.spec.ts', 'redisinsight/ui/**/*.spec.tsx'],
      env: {
        jest: true,
      },
    },
    // TypeScript files (general) - MUST BE LAST to override other rules
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/semi': ['error', 'never'],
        semi: 'off',
      },
    },
    // JavaScript files (general) - MUST BE LAST to override other rules
    {
      files: ['*.js', '*.jsx', '*.cjs'],
      rules: {
        semi: ['error', 'always'],
        '@typescript-eslint/semi': 'off',
      },
    },
    // Temporary disable some rules for API
    {
      files: ['redisinsight/api/**/*.ts'],
      rules: {
        semi: 'off',
        '@typescript-eslint/semi': 'off',
      },
    },
  ],
  parserOptions: {
    project: './tsconfig.json',
    ecmaVersion: 2020,
    sourceType: 'module',
    createDefaultProgram: true,
  },
  ignorePatterns: [
    'dist',
    'node_modules',
    'release',
    'redisinsight/ui/src/packages/**/icons/*.js',
    'redisinsight/api/report/**',
    'redisinsight/api/migration/**',
  ],
};
