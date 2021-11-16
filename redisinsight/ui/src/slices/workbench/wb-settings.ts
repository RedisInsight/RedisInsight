import { createSlice } from '@reduxjs/toolkit'
import { apiService } from 'uiSrc/services'
import { ApiEndpoints, BrowserStorageItem } from 'uiSrc/constants'
import { getApiErrorMessage, getUrl, isStatusSuccessful } from 'uiSrc/utils'

import { CreateCliClientResponse } from 'apiSrc/modules/cli/dto/cli.dto'
import { AppDispatch, RootState } from '../store'
import { StateWorkbenchSettings } from '../interfaces'
// import { addErrorNotification } from '../app/notifications';

export const initialState: StateWorkbenchSettings = {
  loading: false,
  error: '',
  errorClient: '',
  wbClientUuid: '',
  unsupportedCommands: [],
}

// A slice for recipes
const workbenchSettingsSlice = createSlice({
  name: 'workbenchSettings',
  initialState,
  reducers: {
    setWBSettingsInitialState: () => initialState,

    // create, update, delete Workbench Client
    processWBClient: (state) => {
      state.loading = true
    },
    processWBClientSuccess: (state, { payload }: { payload: string }) => {
      state.loading = false
      state.wbClientUuid = payload

      state.errorClient = ''
    },
    processWBClientFailure: (state, { payload }) => {
      state.loading = false
      state.errorClient = payload
    },
  },
})

// Actions generated from the slice
export const {
  setWBSettingsInitialState,
  // isModuleLoaded,
  // isModuleLoadedSuccess,
  // isModuleLoadedFailure,
  processWBClient,
  processWBClientSuccess,
  processWBClientFailure,
} = workbenchSettingsSlice.actions

// A selector
export const workbenchSettingsSelector = (state: RootState) => state.workbench.settings

// The reducer
export default workbenchSettingsSlice.reducer

// Asynchronous thunk action
export function createWBClientAction(
  instanceId: string = '',
  onSuccessAction?: () => void,
  onFailAction?: (message: string) => void
) {
  return async (dispatch: AppDispatch) => {
    dispatch(processWBClient())

    try {
      const { data, status } = await apiService.post<CreateCliClientResponse>(
        getUrl(instanceId, ApiEndpoints.CLI),
        { namespace: 'workbench' },
      )

      if (isStatusSuccessful(status)) {
        localStorage.setItem(BrowserStorageItem.wbClientUuid, data?.uuid)
        dispatch(processWBClientSuccess(data?.uuid))

        onSuccessAction?.()
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(processWBClientFailure(errorMessage))
      onFailAction?.(errorMessage)
    }
  }
}

// Asynchronous thunk action
export function updateWBClientAction(
  instanceId: string = '',
  uuid: string,
  onSuccessAction?: () => void,
  onFailAction?: (message: string) => void
) {
  return async (dispatch: AppDispatch) => {
    dispatch(processWBClient())

    try {
      const { data, status } = await apiService.patch<CreateCliClientResponse>(
        getUrl(instanceId, ApiEndpoints.CLI, uuid)
      )

      if (isStatusSuccessful(status)) {
        localStorage.setItem(BrowserStorageItem.wbClientUuid, data?.uuid)
        dispatch(processWBClientSuccess(data?.uuid))

        onSuccessAction?.()
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(processWBClientFailure(errorMessage))
      onFailAction?.(errorMessage)
    }
  }
}
