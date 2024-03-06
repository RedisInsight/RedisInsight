import { Nullable } from 'uiSrc/utils'
import { PageNames } from 'uiSrc/constants'
import { Rdi as RdiInstanceResponse } from 'apiSrc/modules/rdi/models/rdi'

// tabs for dry run job panel
export enum PipelineJobsTabs {
  Transformations = 'transformations',
  Output = 'output'
}

// pipeline management page tabs
export enum RdiPipelineTabs {
  Config = PageNames.rdiPipelineConfig,
  Jobs = PageNames.rdiPipelineJobs
}

export enum DryRunJobResultStatus {
  Success = 'success',
  Failed = 'failed'
}

export interface IRdiPipelineJob {
  name: string
  value: string
}

export interface IPipeline {
  config: string
  jobs: IRdiPipelineJob[]
}

export interface IDryRunJobResults {
  transformations: {
    status: DryRunJobResultStatus
    error?: string
    data?: any
  }
  commands: {
    status: DryRunJobResultStatus
    error?: string
    data?: string[]
  }
}
export enum TestConnectionStatus {
  Fail = 'fail',
  Success = 'success',
}

export interface ITestConnection {
  fail: TestConnectionResult[]
  success: TestConnectionResult[]
}

export interface TestConnectionResult {
  endpoint: string
  index: number
  error?: string
  status: TestConnectionStatus
}

export interface IStateRdiTestConnections {
  loading: boolean
  error: string
  results: Nullable<ITestConnection>
}

export interface IRdiPipelineStrategy {
  label: string
  value: string
}

export interface IRdiPipelineStrategies {
  loading: boolean
  error: string
  dbType: IRdiPipelineStrategy[]
  strategyType: IRdiPipelineStrategy[]
}

export interface IStateRdiPipeline {
  loading: boolean
  error: string
  data: Nullable<IPipeline>
  schema: Nullable<object>
  strategies: IRdiPipelineStrategies
}

export interface IStateRdiDryRunJob {
  loading: boolean
  error: string
  results: Nullable<IDryRunJobResults>
}

export interface RdiInstance extends RdiInstanceResponse {
  visible?: boolean
  loading?: boolean
  error: string
}

export interface InitialStateRdiInstances {
  loading: boolean
  error: string
  data: RdiInstance[]
  connectedInstance: RdiInstance
  loadingChanging: boolean
  errorChanging: string
  changedSuccessfully: boolean
}
