const path = require('path')

module.exports = {
  root: true,
  env: {
    browser: true,
  },
  extends: ['airbnb-typescript', 'airbnb/hooks', 'plugin:sonarjs/recommended'],
  // extends: ['airbnb', 'airbnb/hooks'],
  plugins: ['@typescript-eslint'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: path.join(__dirname, '../../tsconfig.json'),
    createDefaultProgram: true,
  },

  overrides: [
    {
      files: [
        '**/*.spec.ts',
        '**/*.spec.tsx',
        '**/*.spec.ts',
      ],
      env: {
        jest: true,
      },
    },
  ],
  ignorePatterns: ['dist', 'src/packages/redisearch/src/icons/*.js', 'src/packages/clients-list-example/src/icons/*.js'],

  rules: {
    radix: 'off',
    semi: ['error', 'never'],
    'no-bitwise': ['error', { allow: ['|'] }],
    'max-len': ['error', { ignoreComments: true, ignoreStrings: true, ignoreRegExpLiterals: true, code: 110 }],
    'class-methods-use-this': 'off',
    // A temporary hack related to IDE not resolving correct package.json
    'import/no-extraneous-dependencies': 'off',
    'import/prefer-default-export': 'off',
    'import/no-cycle': 'off',
    'import/no-named-as-default-member': 'off',
    'no-plusplus': 'off',
    'no-return-await': 'off',
    'no-underscore-dangle': 'off',
    'no-useless-catch': 'off',
    'jsx-a11y/anchor-is-valid': 'off',
    'max-classes-per-file': 'off',
    'no-case-declarations': 'off',
    'react-hooks/exhaustive-deps': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/require-default-props': 'off',
    '@typescript-eslint/comma-dangle': 'off',
    '@typescript-eslint/no-shadow': 'off',
    '@typescript-eslint/no-unused-expressions': 'off',
    '@typescript-eslint/semi': ['error', 'never'],
    '@typescript-eslint/no-use-before-define': 'off',
    'implicit-arrow-linebreak': 'off',
    'object-curly-newline': 'off',
    'no-nested-ternary': 'off',
    'no-param-reassign': ['error', { props: false }]
  },
}
