const { TextDecoder, TextEncoder } = require('util');

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  testURL: 'http://localhost/',
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|ico|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/redisinsight/__mocks__/fileMock.js',
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
    'uiSrc/(.*)': '<rootDir>/redisinsight/ui/src/$1',
    'monaco-editor': '<rootDir>/redisinsight/__mocks__/monacoMock.js',
    unified: '<rootDir>/redisinsight/__mocks__/unified.js',
    'remark-parse': '<rootDir>/redisinsight/__mocks__/remarkParse.js',
    'remark-gfm': '<rootDir>/redisinsight/__mocks__/remarkGfm.js',
    'remark-rehype': '<rootDir>/redisinsight/__mocks__/remarkRehype.js',
    'rehype-stringify': '<rootDir>/redisinsight/__mocks__/rehypeStringify.js',
    'unist-util-visit': '<rootDir>/redisinsight/__mocks__/unistUtilsVisit.js',
  },
  setupFilesAfterEnv: [
    '<rootDir>/redisinsight/ui/src/setup-tests.ts',
  ],
  moduleDirectories: [
    'node_modules',
    'redisinsight/node_modules',
  ],
  moduleFileExtensions: [
    'js',
    'jsx',
    'ts',
    'tsx',
    'json',
  ],
  testEnvironment: 'jsdom',
  // testEnvironment: 'jest-environment-jsdom',
  transformIgnorePatterns: [
    'node_modules/(?!(monaco-editor|react-monaco-editor)/)',
  ],
  globals: {
    TextDecoder,
    TextEncoder,
  },
};
