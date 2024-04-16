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

export interface IConnections {
  [key: string]: {
    host: string;
    port: number;
    status: string;
    type: string;
    database: string;
    user: string;
  }
}

export interface IDataStreams {
  [key: string]: {
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

export interface IClients {
  [key: string]: {
    addr: string
    name: string
    ageSec: number
    idleSec: number
    user: string
  }
}

export enum RdiPipelineStatus {
  Success = 'success',
  Failed = 'failed'
}

export interface IRdiStatistics {
  status: RdiPipelineStatus,
  data: {
    connections: IConnections
    dataStreams: IDataStreams
    processingPerformance: IProcessingPerformance
    rdiPipelineStatus: IRdiPipelineStatus
    clients: IClients
  }
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

export interface IStateRdiStatistics {
  loading: boolean
  error: string
  results: Nullable<IRdiStatistics>
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
  isPipelineLoaded: boolean
}
