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

export interface IStateRdiPipeline {
  loading: boolean
  error: string
  data: Nullable<IPipeline>
  isDeployPopoverOpen: boolean
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
