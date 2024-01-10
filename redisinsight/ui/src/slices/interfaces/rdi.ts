import { Nullable } from 'uiSrc/utils'
import { Rdi as RdiInstanceResponse } from 'apiSrc/modules/rdi/models/rdi'

export interface IPipeline {
  config: string
  jobs: any[]
}

export interface IStateRdiPipeline {
  loading: boolean
  error: string
  data: Nullable<IPipeline>
}
export interface RdiInstance extends RdiInstanceResponse {
  visible?: boolean
  loading?: boolean
  error: string,
}

export interface InitialStateRdiInstances {
  loading: boolean
  error: string
  data: RdiInstance[]
  connectedInstance: RdiInstance
  editedInstance: InitialStateEditedRdiInstances
  loadingChanging: boolean
  errorChanging: string
  changedSuccessfully: boolean
}

export interface InitialStateEditedRdiInstances {
  loading: boolean
  error: string
  data: Nullable<RdiInstance>
}
