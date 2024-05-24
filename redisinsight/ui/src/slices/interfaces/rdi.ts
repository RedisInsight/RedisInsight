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

export interface IRdiPipelineJob {
  name: string
  value: string
}

export interface IPipeline {
  config: string
  jobs: IRdiPipelineJob[]
}

export interface IPipelineJSON {
  config: object
  jobs: { [key: string]: any }
}

interface IDryRunJobOutput {
  connection: string
  commands: string[]
}

export interface IDryRunJobResults {
  transformation: object
  output: IDryRunJobOutput[]
}

export interface IRdiPipelineStrategy {
  strategy: string
  databases: string[]
}

export interface IRdiPipelineStrategies {
  loading: boolean
  error: string
  data: IRdiPipelineStrategy[]
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

export enum FileChangeType {
  Added = 'added',
  Modified = 'modified',
  Removed = 'removed',
}

export enum PipelineStatus {
  Validating = 'validating',
  Starting = 'starting',
  Stopping = 'stopping',
  Resetting = 'resetting',
  Ready = 'ready',
  NotReady = 'not-ready',
  Stopped = 'stopped',
}

export interface IPipelineStatus {
  components: Record<string, unknown>
  pipelines: {
    defaults: {
      status: PipelineStatus
      state: unknown
      tasks: unknown
    }
  }
}

export interface IStateRdiPipeline {
  loading: boolean
  error: string
  data: Nullable<IPipeline>
  schema: Nullable<object>
  strategies: IRdiPipelineStrategies
  changes: Record<string, FileChangeType>
  jobFunctions: IStateJobFunction[]
  status: {
    loading: boolean
    error: string
    data: Nullable<IPipelineStatus>
  }
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

export interface IJobFunctionResponse {
  function: string
  description: string
  example: string
  comments: string
}

export interface IStateJobFunction {
  label: string
  detail: string
  documentation: string
}

// Rdi test target connections
export enum TestConnectionStatus {
  Fail = 'fail',
  Success = 'success',
}

interface IErrorDetail {
  code: string;
  message: string;
}

interface ISourceDetail {
  status: TestConnectionStatus;
  error?: IErrorDetail;
}

export interface ISources {
  [key: string]: ISourceDetail;
}

export interface TestConnectionsResponse {
  sources: ISources
}

export interface IRdiConnectionResult {
  target: string;
  error?: string;
}

export interface TransformResult {
  success: IRdiConnectionResult[];
  fail: IRdiConnectionResult[];
}

export interface IStateRdiTestConnections {
  loading: boolean
  error: string
  results: Nullable<TransformResult>
}
