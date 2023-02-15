const { TextDecoder, TextEncoder } = require('util');

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  testURL: 'http://localhost/',
  runner: 'groups',
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|ico|gif|eot|otf|webp|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/redisinsight/__mocks__/fileMock.js',
    '\\.svg': '<rootDir>/redisinsight/__mocks__/svg.js',
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
    'uiSrc/(.*)': '<rootDir>/redisinsight/ui/src/$1',
    'monaco-editor': '<rootDir>/redisinsight/__mocks__/monacoMock.js',
    unified: '<rootDir>/redisinsight/__mocks__/unified.js',
    'remark-parse': '<rootDir>/redisinsight/__mocks__/remarkParse.js',
    'remark-gfm': '<rootDir>/redisinsight/__mocks__/remarkGfm.js',
    'remark-rehype': '<rootDir>/redisinsight/__mocks__/remarkRehype.js',
    'rehype-stringify': '<rootDir>/redisinsight/__mocks__/rehypeStringify.js',
    'unist-util-visit': '<rootDir>/redisinsight/__mocks__/unistUtilsVisit.js',
    'react-children-utilities': '<rootDir>/redisinsight/__mocks__/react-children-utilities.js',
    d3: '<rootDir>/node_modules/d3/dist/d3.min.js',
  },
  setupFiles: [
    '<rootDir>/redisinsight/ui/src/setup-env.ts',
  ],
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
  transformIgnorePatterns: [
    'node_modules/(?!(monaco-editor|react-monaco-editor)/)',
  ],
  // TODO: add tests for plugins
  modulePathIgnorePatterns: [
    '<rootDir>/redisinsight/ui/src/packages',
    '<rootDir>/redisinsight/ui/src/mocks',
  ],
  coverageDirectory: './coverage',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/redisinsight/api',
    '<rootDir>/redisinsight/ui/src/packages',
  ],
  coverageThreshold: {
    global: {
      statements: 78,
      branches: 61,
      functions: 70,
      lines: 79,
    },
    // './redisinsight/ui/src/slices/**/*.ts': {
    //   statements: 90,
    // },
  },
  globals: {
    TextDecoder,
    TextEncoder,
  },
};
