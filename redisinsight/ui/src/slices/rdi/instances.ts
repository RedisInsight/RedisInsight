import { first, map } from 'lodash'
import { createSlice } from '@reduxjs/toolkit'

import { AxiosError } from 'axios'
import { ApiEndpoints } from 'uiSrc/constants'
import { apiService } from 'uiSrc/services'
import successMessages from 'uiSrc/components/notifications/success-messages'
import { getApiErrorMessage, isStatusSuccessful, Nullable } from 'uiSrc/utils'
import { Rdi as RdiInstanceResponse } from 'apiSrc/modules/rdi/models/rdi'

import { AppDispatch, RootState } from '../store'
import { addErrorNotification, addMessageNotification } from '../app/notifications'
import { InitialStateRdiInstances, RdiInstance } from '../interfaces/rdi'

export const initialState: InitialStateRdiInstances = {
  loading: true,
  error: '',
  data: [],
  connectedInstance: {
    id: '',
    name: '',
    url: '',
    version: '',
    lastConnection: new Date(),
    loading: false,
    error: '',
  },
  loadingChanging: false,
  errorChanging: '',
  changedSuccessfully: false
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

    // set connected instance
    setConnectedInstance: (state) => {
      state.connectedInstance = {
        ...initialState.connectedInstance,
        loading: true,
      }
    },

    // set connected instance success
    setConnectedInstanceSuccess: (state, { payload }: { payload: RdiInstance }) => {
      state.connectedInstance = payload
      state.connectedInstance.loading = false
    },

    // set connected instance failed
    setConnectedInstanceFailure: (state, { payload }) => {
      state.connectedInstance.error = payload
      state.connectedInstance.loading = false
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
  setConnectedInstance,
  setConnectedInstanceSuccess,
  setConnectedInstanceFailure,
  resetConnectedInstance
} = instancesSlice.actions

// selectors
export const instancesSelector = (state: RootState) => state.rdi.instances
export const connectedInstanceSelector = (state: RootState) =>
  state.rdi.instances.connectedInstance

// The reducer
export default instancesSlice.reducer

// Asynchronous thunk action
export function fetchInstancesAction(onSuccess?: (data?: RdiInstanceResponse[]) => void) {
  return async (dispatch: AppDispatch) => {
    dispatch(loadInstances())

    try {
      const { data, status } = await apiService.get<RdiInstanceResponse[]>(ApiEndpoints.RDI_INSTANCES)

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
export function createInstanceAction(payload: Partial<RdiInstance>, onSuccess?: (data: RdiInstanceResponse) => void) {
  return async (dispatch: AppDispatch) => {
    dispatch(defaultInstanceChanging())

    try {
      const { status, data } = await apiService.post<RdiInstanceResponse>(`${ApiEndpoints.RDI_INSTANCES}`, payload)

      if (isStatusSuccessful(status)) {
        dispatch(defaultInstanceChangingSuccess())
        dispatch(fetchInstancesAction())

        dispatch(addMessageNotification(successMessages.ADDED_NEW_RDI_INSTANCE(payload.name ?? '')))
        onSuccess?.(data)
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(defaultInstanceChangingFailure(errorMessage))
      dispatch(addErrorNotification(error))
    }
  }
}

// Asynchronous thunk action
export function editInstanceAction(
  { id, ...payload }: Partial<RdiInstance>,
  onSuccess?: (data: RdiInstanceResponse) => void
) {
  return async (dispatch: AppDispatch) => {
    dispatch(defaultInstanceChanging())

    try {
      const { status, data } = await apiService.patch<RdiInstanceResponse>(
        `${ApiEndpoints.RDI_INSTANCES}/${id}`,
        payload
      )

      if (isStatusSuccessful(status)) {
        dispatch(defaultInstanceChangingSuccess())
        dispatch(fetchInstancesAction())

        onSuccess?.(data)
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(defaultInstanceChangingFailure(errorMessage))
      dispatch(addErrorNotification(error))
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

      const { status } = await apiService.delete(ApiEndpoints.RDI_INSTANCES, {
        data: { ids: instancesIds }
      })

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

export function fetchConnectedInstanceAction(id: string, onSuccess?: () => void) {
  return async (dispatch: AppDispatch) => {
    dispatch(setConnectedInstance())

    try {
      const { data, status } = await apiService.get<RdiInstanceResponse>(`${ApiEndpoints.RDI_INSTANCES}/${id}`)

      if (isStatusSuccessful(status)) {
        dispatch(setConnectedInstanceSuccess(data))
      }
      onSuccess?.()
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(setConnectedInstanceFailure(errorMessage))
      dispatch(addErrorNotification(error))
    }
  }
}
