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

export interface StateTriggeredFunctions {
  libraries: Nullable<TriggeredFunctionsLibrary[]>
  selectedLibrary: {
    lastRefresh: Nullable<number>
    data: Nullable<TriggeredFunctionsLibraryDetails>
    loading: boolean
  }
  loading: boolean,
  lastRefresh: Nullable<number>
  error: string
}
