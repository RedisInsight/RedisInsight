import { createSlice } from '@reduxjs/toolkit'
import { first } from 'lodash'
import { WBQueryType } from 'uiSrc/pages/workbench/constants'
import { apiService, localStorageService } from 'uiSrc/services'
import { ApiEndpoints, BrowserStorageItem } from 'uiSrc/constants'
import { WBHistoryObject } from 'uiSrc/pages/workbench/interfaces'
import { addErrorNotification } from 'uiSrc/slices/app/notifications'
import { CliOutputFormatterType } from 'uiSrc/constants/cliOutput'
import {
  getApiErrorMessage,
  getUrl,
  isStatusSuccessful,
  multilineCommandToOneLine,
} from 'uiSrc/utils'

import {
  SendClusterCommandDto,
  SendClusterCommandResponse,
  SendCommandResponse,
} from 'apiSrc/modules/cli/dto/cli.dto'
import { AppDispatch, RootState } from '../store'
import { StateWorkbenchResults } from '../interfaces'

export const initialState: StateWorkbenchResults = {
  loading: false,
  error: '',
  commandHistory: localStorageService?.get(BrowserStorageItem.wbInputHistory) ?? [],
}

// A slice for recipes
const workbenchResultsSlice = createSlice({
  name: 'workbenchResults',
  initialState,
  reducers: {
    setWBResultsInitialState: () => initialState,

    // Send Workbench command to API
    sendWBCommand: (state) => {
      state.loading = true
      state.error = ''
    },
    sendWBCommandSuccess: (state) => {
      state.loading = false

      state.error = ''
    },
    sendWBCommandFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },

    // Update Workbench command History
    updateWBCommandHistory: (state, { payload }: { payload: string[] }) => {
      state.commandHistory = payload
    },
  },
})

// Actions generated from the slice
export const {
  setWBResultsInitialState,
  sendWBCommand,
  sendWBCommandSuccess,
  sendWBCommandFailure,
  updateWBCommandHistory,
} = workbenchResultsSlice.actions

// A selector
export const workbenchResultsSelector = (state: RootState) => state.workbench.results

// The reducer
export default workbenchResultsSlice.reducer

// Asynchronous thunk action
export function sendWBCommandAction({
  command = '',
  historyId,
  queryType,
  onSuccessAction,
  onFailAction,
}: {
  command: string;
  historyId: number;
  queryType: WBQueryType;
  onSuccessAction?: (historyResponse: WBHistoryObject) => void;
  onFailAction?: () => void;
}) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    try {
      const state = stateInit()
      const { id = '' } = state.connections.instances.connectedInstance
      const outputFormat = queryType === WBQueryType.Text
        ? CliOutputFormatterType.Text
        : CliOutputFormatterType.Raw

      dispatch(sendWBCommand())

      const { data, status } = await apiService.post<SendCommandResponse>(
        getUrl(
          id,
          ApiEndpoints.CLI,
          state.workbench.settings?.wbClientUuid,
          ApiEndpoints.SEND_COMMAND
        ),
        {
          command: multilineCommandToOneLine(command),
          outputFormat,
        }
      )

      if (isStatusSuccessful(status)) {
        dispatch(sendWBCommandSuccess())

        onSuccessAction?.({
          id: historyId,
          query: command,
          status: data.status,
          time: Date.now(),
          data: data.response
        })
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(sendWBCommandFailure(errorMessage))
      onFailAction?.()
    }
  }
}

// Asynchronous thunk action
export function sendWBCommandClusterAction({
  command = '',
  historyId,
  queryType,
  options,
  onSuccessAction,
  onFailAction,
}: {
  command: string;
  historyId: number;
  queryType: WBQueryType;
  options: SendClusterCommandDto;
  onSuccessAction?: (historyResponse: WBHistoryObject) => void;
  onFailAction?: () => void;
}) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    try {
      const state = stateInit()
      const { id = '' } = state.connections.instances.connectedInstance
      const outputFormat = queryType === WBQueryType.Text
        ? CliOutputFormatterType.Text
        : CliOutputFormatterType.Raw

      dispatch(sendWBCommand())

      const { data, status } = await apiService.post<SendClusterCommandResponse[]>(
        getUrl(
          id,
          ApiEndpoints.CLI,
          state.workbench.settings?.wbClientUuid,
          ApiEndpoints.SEND_CLUSTER_COMMAND
        ),
        {
          ...options,
          command: multilineCommandToOneLine(command),
          outputFormat,
        }
      )

      if (isStatusSuccessful(status)) {
        dispatch(sendWBCommandSuccess())

        onSuccessAction?.({
          id: historyId,
          query: command,
          status: first(data)?.status,
          time: Date.now(),
          data: first(data)?.response,
        })
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(sendWBCommandFailure(errorMessage))
      onFailAction?.()
    }
  }
}
