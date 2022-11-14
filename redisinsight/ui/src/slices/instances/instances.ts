import { first, map } from 'lodash'
import { createSlice } from '@reduxjs/toolkit'
import axios, { AxiosError, CancelTokenSource } from 'axios'

import ApiErrors from 'uiSrc/constants/apiErrors'
import { apiService, localStorageService } from 'uiSrc/services'
import { ApiEndpoints, BrowserStorageItem } from 'uiSrc/constants'
import { setAppContextInitialState } from 'uiSrc/slices/app/context'
import successMessages from 'uiSrc/components/notifications/success-messages'
import { checkRediStack, getApiErrorMessage, isStatusSuccessful, Nullable } from 'uiSrc/utils'
import { Database as DatabaseInstanceResponse } from 'apiSrc/modules/database/models/database'
import { fetchMastersSentinelAction } from './sentinel'

import { AppDispatch, RootState } from '../store'
import { addErrorNotification, addMessageNotification } from '../app/notifications'
import { Instance, InitialStateInstances, ConnectionType } from '../interfaces'

export const initialState: InitialStateInstances = {
  loading: false,
  error: '',
  data: [],
  loadingChanging: false,
  errorChanging: '',
  changedSuccessfully: false,
  deletedSuccessfully: false,
  connectedInstance: {
    id: '',
    name: '',
    host: '',
    port: 0,
    nameFromProvider: '',
    lastConnection: new Date(),
    connectionType: ConnectionType.Standalone,
    isRediStack: false,
    modules: [],
    loading: false,
  },
  editedInstance: {
    loading: false,
    error: '',
    data: null,
  },
  instanceOverview: {
    version: '',
  },
  importInstances: {
    loading: false,
    error: '',
    data: null
  },
}

// A slice for recipes
const instancesSlice = createSlice({
  name: 'instances',
  initialState,
  reducers: {
    // load instances
    loadInstances: (state) => {
      state.loading = true
      state.error = ''
    },
    loadInstancesSuccess: (state, { payload }: { payload: Instance[] }) => {
      state.data = checkRediStack(payload)
      state.loading = false
      if (state.connectedInstance.id) {
        const isRediStack = state.data.find((db) => db.id === state.connectedInstance.id)?.isRediStack
        state.connectedInstance.isRediStack = isRediStack || false
      }
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

    changeInstanceAlias: (state) => {
      state.loadingChanging = true
      state.errorChanging = ''
    },
    changeInstanceAliasSuccess: (state, { payload }) => {
      const { id, newName } = payload
      state.data = state.data.map((item: Instance) => {
        if (item.id === id) {
          item.name = newName
        }
        return item
      })
      state.loadingChanging = false
    },
    changeInstanceAliasFailure: (state, { payload = '' }) => {
      state.loadingChanging = false
      state.errorChanging = payload.toString()
    },

    resetInstanceUpdate: (state) => {
      state.loadingChanging = false
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
    getDatabaseConfigInfo: (state) => {
      state.loading = true
      state.error = ''
    },
    getDatabaseConfigInfoSuccess: (state, { payload }) => {
      state.loading = false
      state.instanceOverview = {
        version: state.instanceOverview.version,
        ...payload
      }
    },
    getDatabaseConfigInfoFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },

    // set connected instance id
    setConnectedInstanceId: (state, { payload }: { payload: string }) => {
      state.connectedInstance = {
        ...state.connectedInstance,
        id: payload,
      }
    },

    // set connected instance
    setConnectedInstance: (state) => {
      state.connectedInstance.loading = true
    },

    // set connected instance success
    setConnectedInstanceSuccess: (state, { payload }: { payload: Instance }) => {
      const isRediStack = state.data?.find((db) => db.id === state.connectedInstance.id)?.isRediStack
      state.connectedInstance = payload
      state.connectedInstance.loading = false
      state.connectedInstance.isRediStack = isRediStack || false
    },

    // set edited instance
    setEditedInstance: (state, { payload }: { payload:Nullable<Instance> }) => {
      state.editedInstance.data = payload
    },

    setConnectedInstanceFailure: (state) => {
      state.connectedInstance.loading = false
    },

    // reset connected instance
    resetConnectedInstance: (state) => {
      state.connectedInstance = initialState.connectedInstance
    },

    importInstancesFromFile: (state) => {
      state.importInstances.loading = true
      state.importInstances.error = ''
    },

    importInstancesFromFileSuccess: (state, { payload }) => {
      state.importInstances.loading = false
      state.importInstances.data = payload
    },

    importInstancesFromFileFailure: (state, { payload }) => {
      state.importInstances.loading = false
      state.importInstances.error = payload
    },

    resetImportInstances: (state) => {
      state.importInstances = initialState.importInstances
    }
  },
})

// Actions generated from the slice
export const {
  loadInstances,
  loadInstancesSuccess,
  loadInstancesFailure,
  defaultInstanceChanging,
  defaultInstanceChangingSuccess,
  defaultInstanceChangingFailure,
  setDefaultInstance,
  setDefaultInstanceSuccess,
  setDefaultInstanceFailure,
  setConnectedInstanceSuccess,
  setConnectedInstanceFailure,
  setConnectedInstance,
  setConnectedInstanceId,
  resetConnectedInstance,
  getDatabaseConfigInfo,
  getDatabaseConfigInfoSuccess,
  getDatabaseConfigInfoFailure,
  changeInstanceAlias,
  changeInstanceAliasSuccess,
  changeInstanceAliasFailure,
  resetInstanceUpdate,
  setEditedInstance,
  importInstancesFromFile,
  importInstancesFromFileSuccess,
  importInstancesFromFileFailure,
  resetImportInstances
} = instancesSlice.actions

// selectors
export const instancesSelector = (state: RootState) => state.connections.instances
export const connectedInstanceSelector = (state: RootState) =>
  state.connections.instances.connectedInstance
export const editedInstanceSelector = (state: RootState) =>
  state.connections.instances.editedInstance
export const connectedInstanceOverviewSelector = (state: RootState) =>
  state.connections.instances.instanceOverview
export const importInstancesSelector = (state: RootState) =>
  state.connections.instances.importInstances

// The reducer
export default instancesSlice.reducer

// eslint-disable-next-line import/no-mutable-exports
export let sourceInstance: Nullable<CancelTokenSource> = null

// Asynchronous thunk action
export function fetchInstancesAction(onSuccess?: (data?: DatabaseInstanceResponse[]) => void) {
  return async (dispatch: AppDispatch) => {
    dispatch(loadInstances())

    try {
      const {
        data,
        status,
      }: {
        data: DatabaseInstanceResponse[];
        status: number;
      } = await apiService.get(`${ApiEndpoints.DATABASES}`)

      if (isStatusSuccessful(status)) {
        localStorageService.set(BrowserStorageItem.instancesCount, data?.length)
        onSuccess?.(data)
        dispatch(loadInstancesSuccess(data))
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(loadInstancesFailure(errorMessage))
      dispatch(addErrorNotification(error))

      localStorageService.set(BrowserStorageItem.instancesCount, '0')
    }
  }
}

// Asynchronous thunk action
export function createInstanceStandaloneAction(
  payload: Instance,
  onRedirectToSentinel: () => void
) {
  return async (dispatch: AppDispatch) => {
    dispatch(defaultInstanceChanging())

    try {
      const { status } = await apiService.post(`${ApiEndpoints.DATABASES}`, payload)

      if (isStatusSuccessful(status)) {
        dispatch(defaultInstanceChangingSuccess())
        dispatch<any>(fetchInstancesAction())

        dispatch(addMessageNotification(successMessages.ADDED_NEW_INSTANCE(payload.name ?? '')))
      }
    } catch (_error) {
      const error: AxiosError = _error
      const errorMessage = getApiErrorMessage(error)

      dispatch(defaultInstanceChangingFailure(errorMessage))

      if (error?.response?.data?.error === ApiErrors.SentinelParamsRequired) {
        checkoutToSentinelFlow(payload, dispatch, onRedirectToSentinel)
        return
      }

      dispatch(addErrorNotification(error))
    }
  }
}

// Asynchronous thunk action
export function updateInstanceAction({ id, ...payload }: Instance, onSuccess?: () => void) {
  return async (dispatch: AppDispatch) => {
    dispatch(defaultInstanceChanging())

    try {
      const { status } = await apiService.put(`${ApiEndpoints.DATABASES}/${id}`, payload)

      if (isStatusSuccessful(status)) {
        dispatch(defaultInstanceChangingSuccess())
        dispatch<any>(fetchInstancesAction())
        onSuccess?.()
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(defaultInstanceChangingFailure(errorMessage))
      dispatch(addErrorNotification(error))
    }
  }
}

// Asynchronous thunk action
export function deleteInstancesAction(instances: Instance[], onSuccess?: () => void) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(setDefaultInstance())

    try {
      const state = stateInit()
      const databasesIds = map(instances, 'id')
      const { status } = await apiService.delete(ApiEndpoints.DATABASES, {
        data: { ids: databasesIds },
      })

      if (isStatusSuccessful(status)) {
        dispatch(setDefaultInstanceSuccess())
        dispatch<any>(fetchInstancesAction())

        if (databasesIds.includes(state.app.context.contextInstanceId)) {
          dispatch(resetConnectedInstance())
          dispatch(setAppContextInitialState())
        }
        onSuccess?.()

        if (instances.length === 1) {
          dispatch(
            addMessageNotification(successMessages.DELETE_INSTANCE(first(instances)?.name ?? ''))
          )
        } else {
          dispatch(
            addMessageNotification(successMessages.DELETE_INSTANCES(map(instances, 'name')))
          )
        }
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(setDefaultInstanceFailure(errorMessage))
      dispatch(addErrorNotification(error))
    }
  }
}

// Asynchronous thunk action
export function fetchConnectedInstanceAction(id: string, onSuccess?: () => void) {
  return async (dispatch: AppDispatch) => {
    dispatch(setDefaultInstance())
    dispatch(setConnectedInstance())

    try {
      const { data, status } = await apiService.get<Instance>(`${ApiEndpoints.DATABASES}/${id}`)

      if (isStatusSuccessful(status)) {
        dispatch(setConnectedInstanceSuccess(data))
        dispatch(setDefaultInstanceSuccess())
      }
      onSuccess?.()
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(setDefaultInstanceFailure(errorMessage))
      dispatch(addErrorNotification(error))
    }
  }
}

// Asynchronous thunk action
export function fetchEditedInstanceAction(id: string, onSuccess?: () => void) {
  return async (dispatch: AppDispatch) => {
    dispatch(setDefaultInstance())

    try {
      const { data, status } = await apiService.get<Instance>(`${ApiEndpoints.DATABASES}/${id}`)

      if (isStatusSuccessful(status)) {
        dispatch(setEditedInstance(data))
        dispatch(setDefaultInstanceSuccess())
      }
      onSuccess?.()
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(setConnectedInstanceFailure())
      dispatch(setDefaultInstanceFailure(errorMessage))
      dispatch(addErrorNotification(error))
    }
  }
}

// Asynchronous thunk action
export function checkConnectToInstanceAction(
  id: string = '',
  onSuccessAction?: (id: string) => void,
  onFailAction?: () => void
) {
  return async (dispatch: AppDispatch) => {
    dispatch(setDefaultInstance())
    dispatch(resetConnectedInstance())
    try {
      const { status } = await apiService.get(`${ApiEndpoints.DATABASES}/${id}/connect`)

      if (isStatusSuccessful(status)) {
        dispatch(setDefaultInstanceSuccess())
        onSuccessAction?.(id)
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(setDefaultInstanceFailure(errorMessage))
      dispatch(addErrorNotification({ ...error, instanceId: id }))
      onFailAction?.()
    }
  }
}

const checkoutToSentinelFlow = (
  payload: Instance,
  dispatch: AppDispatch,
  onRedirectToSentinel: () => void
) => {
  const payloadSentinel = { ...payload }
  delete payloadSentinel.name
  delete payloadSentinel.db

  dispatch<any>(fetchMastersSentinelAction(payloadSentinel, onRedirectToSentinel))
}

// Asynchronous thunk action
export function getDatabaseConfigInfoAction(
  id: string,
  onSuccessAction?: (id: string) => void,
  onFailAction?: () => void
) {
  return async (dispatch: AppDispatch) => {
    dispatch(getDatabaseConfigInfo())
    try {
      const { status, data } = await apiService.get(`${ApiEndpoints.DATABASES}/${id}/overview`)

      if (isStatusSuccessful(status)) {
        dispatch(getDatabaseConfigInfoSuccess(data))
        onSuccessAction?.(id)
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(getDatabaseConfigInfoFailure(errorMessage))
      onFailAction?.()
    }
  }
}

// Asynchronous thunk action
export function changeInstanceAliasAction(
  id: string = '',
  newName: string,
  onSuccessAction?: () => void,
  onFailAction?: () => void
) {
  return async (dispatch: AppDispatch) => {
    dispatch(changeInstanceAlias())

    try {
      sourceInstance?.cancel?.()
      const { CancelToken } = axios
      sourceInstance = CancelToken.source()

      const { status } = await apiService.patch(
        `${ApiEndpoints.DATABASES}/${id}/name`,
        { newName },
        { cancelToken: sourceInstance.token }
      )

      sourceInstance = null
      if (isStatusSuccessful(status)) {
        dispatch(changeInstanceAliasSuccess({ id, newName }))
        onSuccessAction?.()
      }
    } catch (error) {
      if (!axios.isCancel(error)) {
        const errorMessage = getApiErrorMessage(error)
        dispatch(changeInstanceAliasFailure(errorMessage))
        dispatch(addErrorNotification(error))
        onFailAction?.()
      }
    }
  }
}

export function resetInstanceUpdateAction() {
  return async (dispatch: AppDispatch) => {
    dispatch(resetInstanceUpdate())
    sourceInstance?.cancel?.()
  }
}

// Asynchronous thunk action
export function uploadInstancesFile(
  file: FormData,
  onSuccessAction?: () => void,
  onFailAction?: () => void
) {
  return async (dispatch: AppDispatch) => {
    dispatch(importInstancesFromFile())

    try {
      const { status, data } = await apiService.post(
        ApiEndpoints.DATABASES_IMPORT,
        file,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'multipart/form-data'
          }
        }
      )

      if (isStatusSuccessful(status)) {
        dispatch(importInstancesFromFileSuccess(data))
        onSuccessAction?.()
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(importInstancesFromFileFailure(errorMessage))
      dispatch(addErrorNotification(error))
      onFailAction?.()
    }
  }
}
