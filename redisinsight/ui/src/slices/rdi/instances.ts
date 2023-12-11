import { first, map } from 'lodash'
import { createSlice } from '@reduxjs/toolkit'

import { AxiosError } from 'axios'
import { ApiEndpoints } from 'uiSrc/constants'
import { apiService } from 'uiSrc/services'
import successMessages from 'uiSrc/components/notifications/success-messages'
import { Nullable, getApiErrorMessage, isStatusSuccessful } from 'uiSrc/utils'
import { Rdi as RdiInstanceResponse } from 'apiSrc/modules/rdi/models/rdi'
import { ExportInstance } from 'apiSrc/modules/rdi/models/export-instance'

import { AppDispatch, RootState } from '../store'
import { addErrorNotification, addMessageNotification } from '../app/notifications'
import { InitialStateRdiInstances, RdiInstance } from '../interfaces/rdi'

export const initialState: InitialStateRdiInstances = {
  loading: false,
  error: '',
  data: [],
  connectedInstance: {
    id: '',
    name: '',
    url: '',
    version: '',
    lastConnection: new Date(),
    loading: false
  },
  editedInstance: {
    loading: false,
    error: '',
    data: null
  },
  loadingChanging: false,
  errorChanging: '',
  changedSuccessfully: false,
  deletedSuccessfully: false
}

// A slice for recipes
const instancesSlice = createSlice({
  name: 'rdiInstances',
  initialState,
  reducers: {
    // load instances
    loadInstances: (state) => {
      state.loading = true
      state.error = ''
    },
    loadInstancesSuccess: (state, { payload }: { payload: RdiInstanceResponse[] }) => {
      state.data = payload
      state.loading = false
    },
    loadInstancesFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },

    // add/edit instance
    defaultInstanceChanging: (state) => {
      state.loadingChanging = true
      state.changedSuccessfully = false
      state.errorChanging = ''
    },
    defaultInstanceChangingSuccess: (state) => {
      state.changedSuccessfully = true
      state.loadingChanging = false
    },
    defaultInstanceChangingFailure: (state, { payload = '' }) => {
      state.loadingChanging = false
      state.changedSuccessfully = false
      state.errorChanging = payload.toString()
    },

    // test instance connection
    testConnection: (state) => {
      state.loadingChanging = true
      state.errorChanging = ''
    },
    testConnectionSuccess: (state) => {
      state.loadingChanging = false
    },
    testConnectionFailure: (state, { payload = '' }) => {
      state.loadingChanging = false
      state.errorChanging = payload.toString()
    },

    // delete instances
    setDefaultInstance: (state) => {
      state.loading = true
      state.error = ''
    },
    setDefaultInstanceSuccess: (state) => {
      state.loading = false
    },
    setDefaultInstanceFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },

    // set connected instance id
    setConnectedInstanceId: (state, { payload }: { payload: string }) => {
      state.connectedInstance = {
        ...state.connectedInstance,
        id: payload
      }
    },

    // set edited instance
    setEditedInstance: (state, { payload }: { payload: Nullable<RdiInstance> }) => {
      state.editedInstance.data = payload
    },

    // reset connected instance
    resetConnectedInstance: (state) => {
      state.connectedInstance = initialState.connectedInstance
    }
  }
})

// Actions generated from the slice
export const {
  loadInstances,
  loadInstancesSuccess,
  loadInstancesFailure,
  defaultInstanceChanging,
  defaultInstanceChangingSuccess,
  defaultInstanceChangingFailure,
  testConnection,
  testConnectionSuccess,
  testConnectionFailure,
  setDefaultInstance,
  setDefaultInstanceSuccess,
  setDefaultInstanceFailure,
  setConnectedInstanceId,
  setEditedInstance,
  resetConnectedInstance
} = instancesSlice.actions

// selectors
export const instancesSelector = (state: RootState) => state.rdi.instances

// The reducer
export default instancesSlice.reducer

// Asynchronous thunk action
export function fetchInstancesAction(onSuccess?: (data?: RdiInstanceResponse[]) => void) {
  return async (dispatch: AppDispatch) => {
    dispatch(loadInstances())

    try {
      // mock response
      const data: RdiInstanceResponse[] = []

      const status = 200

      if (isStatusSuccessful(status)) {
        onSuccess?.(data)
        dispatch(loadInstancesSuccess(data))
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(loadInstancesFailure(errorMessage))
      dispatch(addErrorNotification(error))
    }
  }
}

// Asynchronous thunk action
export function createInstancesAction(onSuccess?: (data?: RdiInstanceResponse[]) => void) {
  return async (dispatch: AppDispatch) => {
    dispatch(loadInstances())

    try {
      // mock response
      const data: RdiInstanceResponse[] = [
        {
          id: '1',
          name: 'My first integration',
          url: 'redis-12345.c253.us-central1-1.gce.cloud.redislabs.com:12345',
          lastConnection: new Date(),
          version: '1.2'
        },
        {
          id: '2',
          name: 'My second integration',
          url: 'redis-67890.c253.us-central1-1.gce.cloud.redislabs.com:67890',
          lastConnection: new Date(),
          version: '1.2'
        }
      ]

      const status = 200

      if (isStatusSuccessful(status)) {
        onSuccess?.(data)
        dispatch(loadInstancesSuccess(data))
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(loadInstancesFailure(errorMessage))
      dispatch(addErrorNotification(error))
    }
  }
}

// Asynchronous thunk action
export function checkConnectToInstanceAction(
  id: string = '',
  onSuccessAction?: (id: string) => void,
  onFailAction?: () => void,
  resetInstance: boolean = true
) {
  return async (dispatch: AppDispatch) => {
    dispatch(setDefaultInstance())
    resetInstance && dispatch(resetConnectedInstance())
    try {
      const { status } = await apiService.get(`${ApiEndpoints.DATABASES}/${id}/connect`)

      if (isStatusSuccessful(status)) {
        dispatch(setDefaultInstanceSuccess())
        onSuccessAction?.(id)
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(setDefaultInstanceFailure(errorMessage))
      dispatch(addErrorNotification({ ...error, instanceId: id }))
      onFailAction?.()
    }
  }
}

// Asynchronous thunk action
export function deleteInstancesAction(instances: RdiInstance[], onSuccess?: () => void) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(setDefaultInstance())

    try {
      const state = stateInit()
      const instancesIds = map(instances, 'id')

      const status = 200

      if (isStatusSuccessful(status)) {
        dispatch(setDefaultInstanceSuccess())
        dispatch<any>(fetchInstancesAction())

        if (instancesIds.includes(state.app.context.contextInstanceId)) {
          dispatch(resetConnectedInstance())
        }
        onSuccess?.()

        if (instances.length === 1) {
          dispatch(addMessageNotification(successMessages.DELETE_RDI_INSTANCE(first(instances)?.name ?? '')))
        } else {
          dispatch(addMessageNotification(successMessages.DELETE_RDI_INSTANCES(map(instances, 'name'))))
        }
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(setDefaultInstanceFailure(errorMessage))
      dispatch(addErrorNotification(error))
    }
  }
}

// Asynchronous thunk action
export function exportInstancesAction(
  ids: string[],
  withSecrets: boolean,
  onSuccess?: (data: ExportInstance) => void,
  onFail?: () => void
) {
  return async (dispatch: AppDispatch) => {
    dispatch(setDefaultInstance())

    try {
      const { data, status } = await apiService.post<ExportInstance>(ApiEndpoints.RDI_INSTANCES_EXPORT, {
        ids,
        withSecrets
      })

      if (isStatusSuccessful(status)) {
        dispatch(setDefaultInstanceSuccess())

        onSuccess?.(data)
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(setDefaultInstanceFailure(errorMessage))
      dispatch(addErrorNotification(error))
      onFail?.()
    }
  }
}
