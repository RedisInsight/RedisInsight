import {
  mockSimpleLibraryReply,
  mockCommonLibraryReply,
} from 'src/__mocks__';
import { FunctionType } from 'src/modules/triggered-functions/models';
import {
  getLibraryFunctions,
  getShortLibraryInformation,
  getLibraryInformation,
} from './triggered-functions.util';

const getLibraryFunctionsTests = [
  {
    input: [
      ...mockCommonLibraryReply,
      'functions', [],
      'keyspace_triggers', [],
      'cluster_functions', [],
      'stream_triggers', [],
    ],
    expected: [],
  },
  {
    input: [
      ...mockCommonLibraryReply,
      'functions', [],
    ],
    expected: [],
  },
  {
    input: [
      ...mockCommonLibraryReply,
      'functions', [['name', 'function', 'description', 'description', 'is_async', 1, 'flags', ['flag1']]],
      'keyspace_triggers', [],
      'cluster_functions', ['foo', 'bar'],
      'stream_triggers', [[
        'name', 'stream', 'description', 'description', 'prefix', 'prefix', 'trim', 0, 'window', 1, 'streams', [['key', 'value']],
      ]],
    ],
    expected: [
      {
        name: 'function',
        description: 'description',
        isAsync: 1,
        flags: ['flag1'],
        type: FunctionType.Function,
        library: 'libraryName',
      },
      {
        name: 'foo',
        library: 'libraryName',
        type: FunctionType.ClusterFunction,
      },
      {
        name: 'bar',
        library: 'libraryName',
        type: FunctionType.ClusterFunction,
      },
      {
        name: 'stream',
        description: 'description',
        type: FunctionType.StreamTrigger,
        window: 1,
        trim: 0,
        prefix: 'prefix',
        library: 'libraryName',
      },
    ],
  },
];

describe('getLibraryFunctions', () => {
  it.each(getLibraryFunctionsTests)('%j', ({ input, expected }) => {
    expect(getLibraryFunctions(input as string[])).toEqual(expected);
  });
});

const getShortLibraryInformationTests = [
  {
    input: mockSimpleLibraryReply,
    expected: {
      name: 'libraryName',
      pendingJobs: 0,
      user: 'default',
      totalFunctions: 4,
    },
  },
  {
    input: [
      ...mockCommonLibraryReply,
      'functions', [],
      'keyspace_triggers', [],
      'cluster_functions', [],
      'stream_triggers', [],
    ],
    expected: {
      name: 'libraryName',
      pendingJobs: 0,
      user: 'default',
      totalFunctions: 0,
    },
  },
  {
    input: [
      ...mockCommonLibraryReply,
      'functions', ['foo'],
    ],
    expected: {
      name: 'libraryName',
      pendingJobs: 0,
      user: 'default',
      totalFunctions: 1,
    },
  },
];

describe('getShortLibraryInformation', () => {
  test.each(getShortLibraryInformationTests)('%j', ({ input, expected }) => {
    expect(getShortLibraryInformation(input as string[])).toEqual(expected);
  });
});

const getLibraryInformationTests = [
  {
    input: [
      ...mockSimpleLibraryReply,
      'code', 'some code',
    ],
    expected: {
      name: 'libraryName',
      pendingJobs: 0,
      user: 'default',
      apiVersion: '1.0',
      code: 'some code',
      configuration: null,
      functions: [
        { name: 'foo', type: FunctionType.Function },
        { name: 'cluster', type: FunctionType.ClusterFunction },
        { name: 'keyspace', type: FunctionType.KeyspaceTrigger },
        { name: 'stream', type: FunctionType.StreamTrigger },
      ],
    },
  },
  {
    input: [
      ...mockCommonLibraryReply,
      'functions', ['foo'],
      'cluster_functions', ['cluster'],
      'keyspace_triggers', ['keyspace'],
      'code', 'some code',
    ],
    expected: {
      name: 'libraryName',
      pendingJobs: 0,
      user: 'default',
      apiVersion: '1.0',
      code: 'some code',
      configuration: null,
      functions: [
        { name: 'foo', type: FunctionType.Function },
        { name: 'cluster', type: FunctionType.ClusterFunction },
        { name: 'keyspace', type: FunctionType.KeyspaceTrigger },
      ],
    },
  },
];

describe('getLibraryInformation', () => {
  it.each(getLibraryInformationTests)('%j', ({ input, expected }) => {
    expect(getLibraryInformation(input as string[])).toEqual(expected);
  });
});
