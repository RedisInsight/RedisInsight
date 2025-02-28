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
    semi: ['error', 'always'],
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
    '@typescript-eslint/semi': ['error', 'never'],
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
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/semi': ['error', 'never'],
        semi: 'off',
      },
    },
    {
      files: ['*.js', '*.jsx', '*.cjs'],
      rules: {
        semi: ['error', 'always'],
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
  ignorePatterns: ['redisinsight/ui', 'redisinsight/api'],
}
