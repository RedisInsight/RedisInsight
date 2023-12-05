import { Nullable } from 'uiSrc/utils'
import { Rdi as RdiInstanceResponse } from 'apiSrc/modules/rdi/models/rdi'

export interface RdiInstance extends RdiInstanceResponse {
  visible?: boolean
  loading?: boolean
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
  deletedSuccessfully: boolean
}

export interface InitialStateEditedRdiInstances {
  loading: boolean
  error: string
  data: Nullable<RdiInstance>
}
