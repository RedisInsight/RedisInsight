module.exports = {
  root: true,
  extends: ['airbnb-typescript'],
  plugins: ['@typescript-eslint'],
  parser: '@typescript-eslint/parser',
  rules: {
    'max-len': ['warn', 120],
    'class-methods-use-this': 'off',
    'import/no-extraneous-dependencies': 'off', // temporary disabled
  },
  parserOptions: {
    project: './tsconfig.json',
  },
  ignorePatterns: [
    'redisinsight/ui',
  ],
};
