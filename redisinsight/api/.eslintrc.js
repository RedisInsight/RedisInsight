module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: ['airbnb-typescript/base', 'plugin:sonarjs/recommended'],
  plugins: ['@typescript-eslint', 'sonarjs'],
  parser: '@typescript-eslint/parser',
  rules: {
    'max-len': ['warn', 120],
    '@typescript-eslint/return-await': 'off',
    "@typescript-eslint/dot-notation": "off",
    'import/prefer-default-export': 'off', // ignore "export default" requirement
    'max-classes-per-file': 'off',
    'class-methods-use-this': 'off', // should be ignored since NestJS allow inheritance without using "this" inside class methods
    'no-await-in-loop': 'off',
  },
  parserOptions: {
    project: './tsconfig.json',
  },
  overrides: [
    {
      files: [ '**/*.spec.ts', '**/__mocks__/**/*' ],
      rules: {
        'sonarjs/no-duplicate-string': 0,
        'sonarjs/no-identical-functions': 0,
        'import/first': 0,
      }
    }
  ]
};
