import { Nullable } from 'uiSrc/utils'
import { Rdi as RdiInstanceResponse } from 'apiSrc/modules/rdi/models/rdi'

export enum PipelineJobsTabs {
  Transformations = 'transformations',
  Output = 'output'
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

export interface IConnection {
  name: string
  status: string
  type: string
  host: string
  port: number
  database: string
  user: string
}

export interface IDataStream {
  name: string
  total: number
  pending: number
  inserted: number
  updated: number
  deleted: number
  filtered: number
  rejected: number
  deduplicated: number
  lastArrival: string
}

export interface IProcessingPerformance {
  totalBatches: number
  batchSizeAvg: number
  readTimeAvg: number
  processTimeAvg: number
  ackTimeAvg: number
  totalTimeAvg: number
  recPerSecAvg: number
}

export interface IRdiPipelineStatus {
  rdiVersion: string
  address: string
  runStatus: string
  syncMode: string
}

export interface IClient {
  id: string
  addr: string
  name: string
  age_sec: number
  idle_sec: number
  user: string
}

export interface IRdiStatistics {
  connections: IConnection[]
  dataStreams: IDataStream[]
  processingPerformance: IProcessingPerformance
  rdiPipelineStatus: IRdiPipelineStatus
  clients: IClient[]
}

export interface IStateRdiPipeline {
  loading: boolean
  error: string
  data: Nullable<IPipeline>
  schema: Nullable<object>
}

export interface IStateRdiDryRunJob {
  loading: boolean
  error: string
  results: Nullable<IDryRunJobResults>
}

export interface IStateRdiStatistics {
  loading: boolean
  error: string
  data: Nullable<IRdiStatistics>
}

export interface RdiInstance extends RdiInstanceResponse {
  visible?: boolean
  loading: boolean
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
