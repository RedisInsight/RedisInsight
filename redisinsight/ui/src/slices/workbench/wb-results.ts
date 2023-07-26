import { createSlice } from '@reduxjs/toolkit'
import { AxiosError } from 'axios'
import { reverse } from 'lodash'
import { apiService } from 'uiSrc/services'
import { ApiEndpoints, EMPTY_COMMAND } from 'uiSrc/constants'
import { addErrorNotification } from 'uiSrc/slices/app/notifications'
import { CliOutputFormatterType } from 'uiSrc/constants/cliOutput'
import { RunQueryMode, ResultsMode } from 'uiSrc/slices/interfaces/workbench'
import {
  getApiErrorMessage,
  getUrl,
  isGroupResults,
  isSilentMode,
  isStatusSuccessful,
} from 'uiSrc/utils'
import { WORKBENCH_HISTORY_MAX_LENGTH } from 'uiSrc/pages/workbench/constants'
import { CommandExecutionStatus } from 'uiSrc/slices/interfaces/cli'
import { setDbIndexState } from 'uiSrc/slices/app/context'
import { CreateCommandExecutionsDto } from 'apiSrc/modules/workbench/dto/create-command-executions.dto'

import { AppDispatch, RootState } from '../store'
import {
  CommandExecution,
  StateWorkbenchResults,
} from '../interfaces'

export const initialState: StateWorkbenchResults = {
  loading: false,
  processing: false,
  clearing: false,
  error: '',
  items: [],
}

// A slice for recipes
const workbenchResultsSlice = createSlice({
  name: 'workbenchResults',
  initialState,
  reducers: {
    setWBResultsInitialState: () => initialState,

    // Fetch Workbench history
    loadWBHistory: (state) => {
      state.loading = true
    },

    loadWBHistorySuccess: (state, { payload }:{ payload: CommandExecution[] }) => {
      state.items = payload.map((item) =>
        ({ ...item, command: item.command || EMPTY_COMMAND, emptyCommand: !item.command }))
      state.loading = false
    },

    loadWBHistoryFailure: (state, { payload }) => {
      state.error = payload
      state.loading = false
    },

    // Process Workbench command to API
    processWBCommand: (state, { payload = '' }: { payload: string }) => {
      if (!payload) return

      state.items = [...state.items].map((item) => {
        if (item.id === payload) {
          return { ...item, loading: true }
        }
        return item
      })
    },

    processWBCommandsFailure: (state, { payload }: { payload: { commandsId: string[], error: string } }) => {
      state.items = [...state.items].map((item) => {
        let newItem = item
        payload.commandsId.forEach(() => {
          if (payload.commandsId.indexOf(item?.id as string) !== -1) {
            newItem = {
              ...item,
              result: [{
                response: payload.error,
                status: CommandExecutionStatus.Fail,
              }],
              loading: false,
              isOpen: true,
              error: '',
            }
          }
        })
        return newItem
      })
      state.loading = false
      state.processing = false
    },

    processWBCommandFailure: (state, { payload }: { payload: { id: string, error: string } }) => {
      state.items = [...state.items].map((item) => {
        if (item.id === payload.id) {
          return { ...item, loading: false, error: payload?.error }
        }
        return item
      })
      state.loading = false
      state.processing = false
    },

    sendWBCommand: (state, { payload: { commands, commandId } }:
    { payload: { commands: string[], commandId: string } }) => {
      let newItems = [
        ...commands.map((command, i) => ({
          command,
          id: commandId + i,
          loading: true,
          isOpen: true,
          error: '',
        })),
        ...state.items
      ]

      if (newItems?.length > WORKBENCH_HISTORY_MAX_LENGTH) {
        newItems = newItems.slice(0, WORKBENCH_HISTORY_MAX_LENGTH)
      }

      state.items = newItems
      state.loading = true
      state.processing = true
    },

    sendWBCommandSuccess: (state,
      { payload: { data, commandId, processing } }:
      { payload: { data: CommandExecution[], commandId: string, processing?: boolean } }) => {
      state.items = [...state.items].map((item) => {
        let newItem = item
        data.forEach((command, i) => {
          if (item.id === (commandId + i)) {
            // don't open a card if silent mode and no errors
            newItem = {
              ...command,
              loading: false,
              error: '',
              isOpen: !isSilentMode(command.resultsMode),
            }
          }
        })
        return newItem
      })

      state.loading = false
      state.processing = (state.processing && processing) || false
    },

    fetchWBCommandSuccess: (state, { payload }: { payload: CommandExecution }) => {
      state.items = [...state.items].map((item) => {
        if (item.id === payload.id) {
          return { ...item, ...payload, loading: false, isOpen: true, error: '' }
        }
        return item
      })
    },

    deleteWBCommandSuccess: (state, { payload }: { payload: string }) => {
      state.items = [...state.items.filter((item) => item.id !== payload)]
    },

    // toggle open card
    toggleOpenWBResult: (state, { payload }: { payload: string }) => {
      state.items = [...state.items].map((item) => {
        if (item.id === payload) {
          return { ...item, isOpen: !item.isOpen }
        }
        return item
      })
    },

    resetWBHistoryItems: (state) => {
      state.items = []
    },

    stopProcessing: (state) => {
      state.processing = false
    },

    clearWbResults: (state) => {
      state.clearing = true
    },

    clearWbResultsSuccess: (state) => {
      state.clearing = false
      state.items = []
    },

    clearWbResultsFailed: (state) => {
      state.clearing = false
    }
  },
})

// Actions generated from the slice
export const {
  setWBResultsInitialState,
  loadWBHistory,
  loadWBHistorySuccess,
  loadWBHistoryFailure,
  processWBCommand,
  fetchWBCommandSuccess,
  processWBCommandFailure,
  processWBCommandsFailure,
  sendWBCommand,
  sendWBCommandSuccess,
  toggleOpenWBResult,
  deleteWBCommandSuccess,
  resetWBHistoryItems,
  stopProcessing,
  clearWbResults,
  clearWbResultsSuccess,
  clearWbResultsFailed,
} = workbenchResultsSlice.actions

// A selector
export const workbenchResultsSelector = (state: RootState) => state.workbench.results

// The reducer
export default workbenchResultsSlice.reducer

// Asynchronous thunk actions
export function fetchWBHistoryAction(instanceId: string) {
  return async (dispatch: AppDispatch) => {
    dispatch(loadWBHistory())

    try {
      const { data, status } = await apiService.get<CommandExecution[]>(
        getUrl(
          instanceId,
          ApiEndpoints.WORKBENCH_COMMAND_EXECUTIONS,
        )
      )

      if (isStatusSuccessful(status)) {
        dispatch(loadWBHistorySuccess(data))
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(loadWBHistoryFailure(errorMessage))
    }
  }
}

// Asynchronous thunk action
export function sendWBCommandAction({
  commands = [],
  multiCommands = [],
  mode = RunQueryMode.ASCII,
  resultsMode = ResultsMode.Default,
  commandId = `${Date.now()}`,
  onSuccessAction,
  onFailAction,
}: {
  commands: string[]
  multiCommands?: string[]
  commandId?: string
  mode: RunQueryMode
  resultsMode?: ResultsMode
  onSuccessAction?: (multiCommands: string[]) => void
  onFailAction?: () => void
}) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    try {
      const state = stateInit()
      const { id = '' } = state.connections.instances.connectedInstance

      dispatch(sendWBCommand({
        commands: isGroupResults(resultsMode) ? [`${commands.length} - Command(s)`] : commands,
        commandId
      }))

      dispatch(setDbIndexState(true))

      const { data, status } = await apiService.post<CommandExecution[]>(
        getUrl(
          id,
          ApiEndpoints.WORKBENCH_COMMAND_EXECUTIONS,
        ),
        {
          commands,
          mode,
          resultsMode
        }
      )

      if (isStatusSuccessful(status)) {
        dispatch(sendWBCommandSuccess({ commandId, data: reverse(data), processing: !!multiCommands?.length }))
        dispatch(setDbIndexState(!!multiCommands?.length))
        onSuccessAction?.(multiCommands)
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(processWBCommandsFailure({
        commandsId: commands.map((_, i) => commandId + i),
        error: errorMessage
      }))
      dispatch(setDbIndexState(false))
      onFailAction?.()
    }
  }
}

// Asynchronous thunk action
export function sendWBCommandClusterAction({
  commands = [],
  multiCommands = [],
  options,
  mode = RunQueryMode.ASCII,
  resultsMode = ResultsMode.Default,
  commandId = `${Date.now()}`,
  onSuccessAction,
  onFailAction,
}: {
  commands: string[]
  options: CreateCommandExecutionsDto
  commandId?: string
  multiCommands?: string[]
  mode?: RunQueryMode,
  resultsMode?: ResultsMode
  onSuccessAction?: (multiCommands: string[]) => void
  onFailAction?: () => void
}) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    try {
      const state = stateInit()
      const { id = '' } = state.connections.instances.connectedInstance

      dispatch(sendWBCommand({
        commands: isGroupResults(resultsMode) ? [`${commands.length} - Commands`] : commands,
        commandId
      }))

      const { data, status } = await apiService.post<CommandExecution[]>(
        getUrl(
          id,
          ApiEndpoints.WORKBENCH_COMMAND_EXECUTIONS,
        ),
        {
          ...options,
          commands,
          mode,
          resultsMode,
          outputFormat: CliOutputFormatterType.Raw
        }
      )

      if (isStatusSuccessful(status)) {
        dispatch(sendWBCommandSuccess({ commandId, data: reverse(data), processing: !!multiCommands?.length }))
        onSuccessAction?.(multiCommands)
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(processWBCommandsFailure({
        commandsId: commands.map((_, i) => commandId + i),
        error: errorMessage
      }))
      onFailAction?.()
    }
  }
}

// Asynchronous thunk action
export function fetchWBCommandAction(
  commandId: string,
  onSuccessAction?: () => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    try {
      const state = stateInit()
      const { id = '' } = state.connections.instances.connectedInstance

      dispatch(processWBCommand(commandId))

      const { data, status } = await apiService.get<CommandExecution>(
        getUrl(
          id,
          ApiEndpoints.WORKBENCH_COMMAND_EXECUTIONS,
          commandId
        ),
      )

      if (isStatusSuccessful(status)) {
        dispatch(fetchWBCommandSuccess(data))

        onSuccessAction?.()
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(processWBCommandFailure({ id: commandId, error: errorMessage }))
      onFailAction?.()
    }
  }
}

// Asynchronous thunk action
export function deleteWBCommandAction(
  commandId: string,
  onSuccessAction?: () => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    try {
      const state = stateInit()
      const { id = '' } = state.connections.instances.connectedInstance

      dispatch(processWBCommand(commandId))

      const { status } = await apiService.delete<CommandExecution>(
        getUrl(
          id,
          ApiEndpoints.WORKBENCH_COMMAND_EXECUTIONS,
          commandId,
        ),
      )

      if (isStatusSuccessful(status)) {
        dispatch(deleteWBCommandSuccess(commandId))

        onSuccessAction?.()
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(processWBCommandFailure({ id: commandId, error: errorMessage }))
      onFailAction?.()
    }
  }
}

// Asynchronous thunk action
export function clearWbResultsAction(
  onSuccessAction?: () => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    try {
      const state = stateInit()
      const { id = '' } = state.connections.instances.connectedInstance

      dispatch(clearWbResults())

      const { status } = await apiService.delete(
        getUrl(
          id,
          ApiEndpoints.WORKBENCH_COMMAND_EXECUTIONS,
        ),
      )

      if (isStatusSuccessful(status)) {
        dispatch(clearWbResultsSuccess())

        onSuccessAction?.()
      }
    } catch (_err) {
      const error = _err as AxiosError
      dispatch(addErrorNotification(error))
      dispatch(clearWbResultsFailed())
      onFailAction?.()
    }
  }
}
