import { Nullable } from 'uiSrc/utils'

export interface TriggeredFunctionsFunctions {
  flags: string[]
  isAsync: boolean
  name: string
  type: string
}

export interface TriggeredFunctionsLibrary {
  name: string
  user: string
  pendingJobs: number
  totalFunctions: number
}

export interface StateTriggeredFunctions {
  libraries: Nullable<TriggeredFunctionsLibrary[]>
  loading: boolean,
  lastRefresh: Nullable<number>
  error: string
}
