import { createSlice } from '@reduxjs/toolkit'
import { apiService, sessionStorageService } from 'uiSrc/services'
import { ApiEndpoints, BrowserStorageItem } from 'uiSrc/constants'
import { getApiErrorMessage, getUrl, isStatusSuccessful } from 'uiSrc/utils'
import { CreateCliClientResponse, DeleteClientResponse } from 'apiSrc/modules/cli/dto/cli.dto'

import { AppDispatch, RootState } from '../store'
import { StateCliSettings } from '../interfaces/cli'

export const initialState: StateCliSettings = {
  isMinimizedHelper: false,
  isShowHelper: false,
  isShowCli: false,
  loading: false,
  errorClient: '',
  cliClientUuid: '',
  matchedCommand: '',
  searchedCommand: '',
  searchingCommand: '',
  searchingCommandFilter: '',
  isEnteringCommand: false,
  isSearching: false,
  unsupportedCommands: [],
  blockingCommands: [],
}

// A slice for recipes
const cliSettingsSlice = createSlice({
  name: 'cliSettings',
  initialState,
  reducers: {
    setCliSettingsInitialState: () => initialState,
    // collapse / uncollapse CLI
    toggleCli: (state) => {
      state.isShowCli = !state.isShowCli
    },
    // collapse / uncollapse CLI Helper
    toggleCliHelper: (state) => {
      state.isShowHelper = !state.isShowHelper
      state.isMinimizedHelper = !state.isMinimizedHelper
    },
    // hide / unhide CLI Helper
    toggleHideCliHelper: (state) => {
      state.isMinimizedHelper = !state.isMinimizedHelper
    },

    setMatchedCommand: (state, { payload }: { payload: string }) => {
      state.matchedCommand = payload
      state.isSearching = false
    },

    setCliEnteringCommand: (state) => {
      state.isEnteringCommand = true
    },

    setSearchedCommand: (state, { payload }: { payload: string }) => {
      state.searchedCommand = payload
      state.isSearching = false
    },

    setSearchingCommand: (state, { payload }: { payload: string }) => {
      state.searchingCommand = payload
      state.isSearching = true
      state.isEnteringCommand = false
    },

    setSearchingCommandFilter: (state, { payload }: { payload: string }) => {
      state.searchingCommandFilter = payload
      state.isSearching = true
      state.isEnteringCommand = false
    },

    clearSearchingCommand: (state) => {
      state.searchingCommand = ''
      state.searchedCommand = ''
      state.searchingCommandFilter = ''
      state.isSearching = false
    },

    // create, update, delete CLI Client
    processCliClient: (state) => {
      state.loading = true
    },
    processCliClientSuccess: (state, { payload }: { payload: string }) => {
      state.loading = false
      state.cliClientUuid = payload

      state.errorClient = ''
    },
    processCliClientFailure: (state, { payload }) => {
      state.loading = false
      state.errorClient = payload
    },

    deleteCliClientSuccess: (state) => {
      state.loading = false
      state.cliClientUuid = ''
    },

    getUnsupportedCommandsSuccess: (state, { payload }: { payload: string[] }) => {
      state.loading = false
      state.unsupportedCommands = payload.map((command) => command.toLowerCase())
    },

    getBlockingCommandsSuccess: (state, { payload }: { payload: string[] }) => {
      state.loading = false
      state.blockingCommands = payload.map((command) => command.toLowerCase())
    },

    // reset cli client uuid
    resetCliClientUuid: (state) => {
      state.cliClientUuid = ''
    },

    // reset to collapse CLI
    resetCliSettings: (state) => {
      state.isShowCli = false
      state.cliClientUuid = ''
      state.loading = false
    },

    // reset to collapse CLI Helper
    resetCliHelperSettings: (state) => {
      state.isShowHelper = false
      state.isSearching = false
      state.isEnteringCommand = false
      state.isMinimizedHelper = false
      state.matchedCommand = ''
      state.searchingCommand = ''
      state.searchedCommand = ''
      state.searchingCommandFilter = ''
    },
  },
})

// Actions generated from the slice
export const {
  setCliSettingsInitialState,
  toggleCli,
  toggleCliHelper,
  toggleHideCliHelper,
  setMatchedCommand,
  setSearchedCommand,
  setSearchingCommand,
  setSearchingCommandFilter,
  clearSearchingCommand,
  setCliEnteringCommand,
  processCliClient,
  processCliClientSuccess,
  processCliClientFailure,
  deleteCliClientSuccess,
  resetCliClientUuid,
  resetCliSettings,
  resetCliHelperSettings,
  getUnsupportedCommandsSuccess,
  getBlockingCommandsSuccess,
} = cliSettingsSlice.actions

// A selector
export const cliSettingsSelector = (state: RootState) => state.cli.settings

// The reducer
export default cliSettingsSlice.reducer

// Asynchronous thunk action
export function createCliClientAction(
  onSuccessAction?: () => void,
  onFailAction?: (message: string) => void
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(processCliClient())

    try {
      const state = stateInit()
      const { data, status } = await apiService.post<CreateCliClientResponse>(
        getUrl(state.connections.instances.connectedInstance?.id ?? '', ApiEndpoints.CLI)
      )

      if (isStatusSuccessful(status)) {
        sessionStorageService.set(BrowserStorageItem.cliClientUuid, data?.uuid)
        dispatch(processCliClientSuccess(data?.uuid))

        onSuccessAction?.()
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(processCliClientFailure(errorMessage))
      onFailAction?.(errorMessage)
    }
  }
}

// Asynchronous thunk action
export function updateCliClientAction(
  uuid: string,
  onSuccessAction?: () => void,
  onFailAction?: (message: string) => void
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(processCliClient())

    try {
      const state = stateInit()
      const { data, status } = await apiService.patch<CreateCliClientResponse>(
        getUrl(state.connections.instances.connectedInstance?.id ?? '', ApiEndpoints.CLI, uuid)
      )

      if (isStatusSuccessful(status)) {
        dispatch(processCliClientSuccess(data?.uuid))
        onSuccessAction?.()
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(processCliClientFailure(errorMessage))
      onFailAction?.(errorMessage)
    }
  }
}

// Asynchronous thunk action
export function deleteCliClientAction(
  instanceId: string,
  uuid: string,
  onSuccessAction?: () => void,
  onFailAction?: () => void
) {
  return async (dispatch: AppDispatch) => {
    dispatch(processCliClient())

    try {
      const { status } = await apiService.delete<DeleteClientResponse>(
        getUrl(instanceId, ApiEndpoints.CLI, uuid)
      )

      if (isStatusSuccessful(status)) {
        dispatch(deleteCliClientSuccess())
        onSuccessAction?.()
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(processCliClientFailure(errorMessage))
      onFailAction?.()
    }
  }
}

// Asynchronous thunk action
export function resetCliSettingsAction(
  onSuccessAction?: () => void,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    const state = stateInit()
    const { contextInstanceId } = state.app.context
    const cliClientUuid = sessionStorageService.get(BrowserStorageItem.cliClientUuid) ?? ''

    dispatch(resetCliSettings())
    dispatch(deleteCliClientAction(contextInstanceId, cliClientUuid, onSuccessAction))
  }
}

// Asynchronous thunk action
export function fetchBlockingCliCommandsAction(
  onSuccessAction?: () => void,
  onFailAction?: () => void
) {
  return async (dispatch: AppDispatch) => {
    dispatch(processCliClient())

    try {
      const { data, status } = await apiService.get<string[]>(ApiEndpoints.CLI_BLOCKING_COMMANDS)

      if (isStatusSuccessful(status)) {
        dispatch(getBlockingCommandsSuccess(data))
        onSuccessAction?.()
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(processCliClientFailure(errorMessage))
      onFailAction?.()
    }
  }
}

// Asynchronous thunk action
export function fetchUnsupportedCliCommandsAction(
  onSuccessAction?: () => void,
  onFailAction?: () => void
) {
  return async (dispatch: AppDispatch) => {
    dispatch(processCliClient())

    try {
      const { data, status } = await apiService.get<string[]>(
        ApiEndpoints.CLI_UNSUPPORTED_COMMANDS
      )

      if (isStatusSuccessful(status)) {
        dispatch(getUnsupportedCommandsSuccess(data))
        onSuccessAction?.()
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(processCliClientFailure(errorMessage))
      onFailAction?.()
    }
  }
}
