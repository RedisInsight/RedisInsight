import { createEslintConfig } from '../../eslint.config.mjs';

export default createEslintConfig({
  tsConfigPath: './tsconfig.json',
  additionalRules: {
    'max-len': ['warn', 120],
    '@typescript-eslint/return-await': 'off',
    '@typescript-eslint/dot-notation': 'off',
    'import/prefer-default-export': 'off', // Ignore "export default" requirement
    'max-classes-per-file': 'off',
    'class-methods-use-this': 'off', // Allow NestJS inheritance without "this"
    'no-await-in-loop': 'off',
    'import/no-extraneous-dependencies': 'off',
    'no-param-reassign': 'error',
  },
  additionalOverrides: [
    {
      files: ['**/*.spec.ts', '**/__mocks__/**/*'],
      rules: {
        'sonarjs/no-duplicate-string': 0,
        'sonarjs/no-identical-functions': 0,
        'import/first': 0,
      },
    },
  ],
});


