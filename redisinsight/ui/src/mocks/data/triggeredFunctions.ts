import {
  TriggeredFunctionsFunction,
  FunctionType,
  TriggeredFunctionsLibrary
} from 'uiSrc/slices/interfaces/triggeredFunctions'

export const TRIGGERED_FUNCTIONS_LIBRARIES_LIST_MOCKED_DATA: TriggeredFunctionsLibrary[] = [
  {
    name: 'lib1',
    user: 'user1',
    totalFunctions: 2,
    pendingJobs: 1
  },
  {
    name: 'lib2',
    user: 'user1',
    totalFunctions: 2,
    pendingJobs: 1
  },
  {
    name: 'lib3',
    user: 'user2',
    totalFunctions: 2,
    pendingJobs: 1
  }
]

export const TRIGGERED_FUNCTIONS_LIB_DETAILS_MOCKED_DATA = {
  apiVersion: '1.2',
  code: 'code',
  configuration: 'config',
  functions: [
    { name: 'foo', type: 'functions' },
    { name: 'foo1', type: 'functions' },
    { name: 'foo2', type: 'cluster_functions' },
    { name: 'foo3', type: 'keyspace_triggers' },
  ],
  name: 'lib',
  pendingJobs: 12,
  user: 'default',
}

export const TRIGGERED_FUNCTIONS_FUNCTIONS_LIST_MOCKED_DATA: TriggeredFunctionsFunction[] = [
  {
    name: 'foo1',
    isAsync: false,
    flags: ['flag', 'flag2'],
    description: 'descriptions my description',
    type: 'functions' as FunctionType,
    library: 'libStringLong'
  },
  {
    name: 'foo2',
    isAsync: true,
    flags: ['flag', 'flag2'],
    type: 'functions' as FunctionType,
    library: 'libStringLong'
  },
  {
    name: 'foo3',
    type: 'cluster_functions' as FunctionType,
    library: 'libStringLong'
  },
  {
    name: 'foo4',
    success: 3,
    fail: 1,
    total: 4,
    lastError: 'Some error',
    lastExecutionTime: 39,
    totalExecutionTime: 39,
    description: 'description',
    type: 'keyspace_triggers' as FunctionType,
    library: 'libStringLong'
  },
  {
    name: 'foo5',
    prefix: 'name',
    trim: false,
    window: 1,
    description: null,
    type: 'stream_triggers' as FunctionType,
    library: 'libStringLong'
  },
]
