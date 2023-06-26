import { Nullable } from 'uiSrc/utils'

export enum FunctionType {
  Function = 'functions',
  ClusterFunction = 'cluster_functions',
  KeyspaceTrigger = 'keyspace_triggers',
  StreamTrigger = 'stream_triggers',
}

export interface TriggeredFunctionsLibraryDetails {
  apiVersion: string
  code: string
  configuration: Nullable<string>
  functions: Array<{
    type: FunctionType
    name: string
  }>
  name: string
  pendingJobs: number
  user: string
}

export interface TriggeredFunctionsLibrary {
  name: string
  user: string
  pendingJobs: number
  totalFunctions: number
}

export interface TriggeredFunctionsFunction {
  name: string
  library: string
  type: FunctionType
  isAsync?: boolean
  success?: number
  fail?: number
  total?: number
  flags?: string[]
  description?: Nullable<string>
  lastError?: Nullable<string>
  lastExecutionTime?: number
  totalExecutionTime?: number
  prefix?: string
  trim?: boolean
  window?: number
}

export interface StateTriggeredFunctions {
  libraries: {
    data: Nullable<TriggeredFunctionsLibrary[]>
    loading: boolean,
    lastRefresh: Nullable<number>
    error: string
    selected: Nullable<string>
  }
  functions: {
    data: Nullable<TriggeredFunctionsFunction[]>
    loading: boolean,
    lastRefresh: Nullable<number>
    error: string
    selected: Nullable<TriggeredFunctionsFunction>
  }
  selectedLibrary: {
    lastRefresh: Nullable<number>
    data: Nullable<TriggeredFunctionsLibraryDetails>
    loading: boolean
  }
}
