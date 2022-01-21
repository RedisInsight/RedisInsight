import { flatMap, isEmpty, reject } from 'lodash'
import { createSlice } from '@reduxjs/toolkit'

import {
  getApiErrorMessage,
  getUrl,
  isStatusSuccessful,
  multilineCommandToOneLine
} from 'uiSrc/utils'
import { apiService } from 'uiSrc/services'
import { ApiEndpoints } from 'uiSrc/constants'
import { IPlugin, PluginsResponse, StateAppPlugins } from 'uiSrc/slices/interfaces'
import { SendCommandResponse } from 'src/modules/cli/dto/cli.dto'

import { AppDispatch, RootState } from '../store'

export const initialState: StateAppPlugins = {
  loading: false,
  error: '',
  staticPath: '',
  plugins: [],
  visualizations: []
}

// A slice for recipes
const appPluginsSlice = createSlice({
  name: 'appPlugins',
  initialState,
  reducers: {
    setAppPluginsInitialState: () => initialState,
    getAllPlugins: (state) => {
      state.loading = true
      state.error = ''
    },
    getAllPluginsSuccess: (state, { payload }: { payload: PluginsResponse }) => {
      state.loading = false
      state.staticPath = payload?.static
      state.plugins = reject(payload?.plugins, isEmpty)
      state.visualizations = flatMap(
        reject(payload?.plugins, isEmpty),
        (plugin: IPlugin) => plugin.visualizations.map((view) => ({
          ...view,
          plugin: {
            name: plugin.name,
            baseUrl: plugin.baseUrl,
            internal: plugin.internal,
            stylesSrc: plugin.styles,
            scriptSrc: plugin.main
          },
          uniqId: `${plugin.name}__${view.id}`
        }))
      )
    },
    getAllPluginsFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
  },
})

// Actions generated from the slice
export const {
  setAppPluginsInitialState,
  getAllPlugins,
  getAllPluginsSuccess,
  getAllPluginsFailure
} = appPluginsSlice.actions

// Selectors
export const appPluginsSelector = (state: RootState) =>
  state.app.plugins

// The reducer
export default appPluginsSlice.reducer

// Asynchronous thunk action
export function loadPluginsAction() {
  return async (dispatch: AppDispatch) => {
    dispatch(getAllPlugins())

    try {
      const { data, status } = await apiService.get(
        `${ApiEndpoints.PLUGINS}`
      )

      if (isStatusSuccessful(status)) {
        dispatch(getAllPluginsSuccess(data))
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(getAllPluginsFailure(errorMessage))
    }
  }
}

// Asynchronous thunk action
export function sendPluginCommandAction({ command = '', onSuccessAction, onFailAction }: {
  command: string;
  onSuccessAction?: (responseData: any) => void;
  onFailAction?: () => void;
}) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    try {
      const state = stateInit()
      const { id = '' } = state.connections.instances.connectedInstance

      const { data, status } = await apiService.post<SendCommandResponse>(
        getUrl(
          id,
          ApiEndpoints.PLUGINS,
          ApiEndpoints.COMMAND_EXECUTIONS
        ),
        {
          command: multilineCommandToOneLine(command)
        }
      )

      if (isStatusSuccessful(status)) {
        onSuccessAction?.(data)
      }
    } catch (error) {
      onFailAction?.()
    }
  }
}
