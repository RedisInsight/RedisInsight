import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import axios, { CancelTokenSource } from 'axios'
import * as jsonpath from 'jsonpath'

import { ApiEndpoints } from 'uiSrc/constants'
import { apiService } from 'uiSrc/services'
import { getBasedOnViewTypeEvent, sendEventTelemetry, TelemetryEvent, getJsonPathLevel } from 'uiSrc/telemetry'
import {
  getApiErrorMessage,
  getUrl,
  isStatusSuccessful,
  Maybe,
  Nullable,
} from 'uiSrc/utils'
import successMessages from 'uiSrc/components/notifications/success-messages'

import {
  GetRejsonRlResponseDto,
  RemoveRejsonRlResponse,
} from 'apiSrc/modules/browser/rejson-rl/dto'

import { refreshKeyInfoAction } from './keys'
import { InitialStateRejson, RedisResponseBuffer } from '../interfaces'
import { addErrorNotification, addMessageNotification } from '../app/notifications'
import { AppDispatch, RootState } from '../store'

export const initialState: InitialStateRejson = {
  loading: false,
  error: '',
  data: {
    downloaded: false,
    data: undefined,
    type: '',
  },
}

// A slice for recipes
const rejsonSlice = createSlice({
  name: 'rejson',
  initialState,
  reducers: {
    // load reJSON part
    loadRejsonBranch: (state, { payload: resetData = true }: PayloadAction<Maybe<boolean>>) => {
      state.loading = true
      state.error = ''

      if (resetData) {
        state.data = initialState.data
      }
    },
    loadRejsonBranchSuccess: (state, { payload }) => {
      state.data = payload
      state.loading = false
    },
    loadRejsonBranchFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
    appendReJSONArrayItem: (state) => {
      state.loading = true
      state.error = ''
    },
    appendReJSONArrayItemSuccess: (state) => {
      state.loading = false
      state.error = ''
    },
    appendReJSONArrayItemFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
    setReJSONData: (state) => {
      state.loading = true
      state.error = ''
    },
    setReJSONDataSuccess: (state) => {
      state.loading = false
      state.error = ''
    },
    setReJSONDataFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
    removeRejsonKey: (state) => {
      state.loading = true
      state.error = ''
    },
    removeRejsonKeySuccess: (state) => {
      state.loading = false
      state.error = ''
    },
    removeRejsonKeyFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
  },
})

// Actions generated from the slice
export const {
  loadRejsonBranch,
  loadRejsonBranchSuccess,
  loadRejsonBranchFailure,
  appendReJSONArrayItem,
  appendReJSONArrayItemSuccess,
  appendReJSONArrayItemFailure,
  setReJSONData,
  setReJSONDataSuccess,
  setReJSONDataFailure,
  removeRejsonKey,
  removeRejsonKeySuccess,
  removeRejsonKeyFailure,
} = rejsonSlice.actions

// A selector
export const rejsonSelector = (state: RootState) => state.browser.rejson
export const rejsonDataSelector = (state: RootState) =>
  state.browser.rejson?.data

// The reducer
export default rejsonSlice.reducer

// eslint-disable-next-line import/no-mutable-exports
export let sourceRejson: Nullable<CancelTokenSource> = null

// Asynchronous thunk action
export function fetchReJSON(key: RedisResponseBuffer, path = '.', resetData?: boolean) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(loadRejsonBranch(resetData))

    try {
      sourceRejson?.cancel?.()

      const { CancelToken } = axios
      sourceRejson = CancelToken.source()

      const state = stateInit()
      const { encoding } = state.app.info
      const { data, status } = await apiService.post<GetRejsonRlResponseDto>(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          ApiEndpoints.REJSON_GET
        ),
        {
          keyName: key,
          path,
          forceRetrieve: false,
          encoding,
        },
        { cancelToken: sourceRejson.token }
      )

      sourceRejson = null
      if (isStatusSuccessful(status)) {
        dispatch(loadRejsonBranchSuccess(data))
      }
    } catch (error) {
      if (!axios.isCancel(error)) {
        const errorMessage = getApiErrorMessage(error)
        dispatch(loadRejsonBranchFailure(errorMessage))
        dispatch(addErrorNotification(error))
      }
    }
  }
}

// Asynchronous thunk action
export function setReJSONDataAction(
  key: string,
  path: string,
  data: string,
  onSuccessAction?: () => void,
  onFailAction?: () => void
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(setReJSONData())

    try {
      const state = stateInit()
      const { status } = await apiService.patch<GetRejsonRlResponseDto>(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          ApiEndpoints.REJSON_SET
        ),
        {
          keyName: key,
          path,
          data,
        }
      )

      if (isStatusSuccessful(status)) {
        try {
          const isEditMode = jsonpath.query(state.browser.rejson?.data?.data, `$..${path}`).length > 0
          sendEventTelemetry({
            event: getBasedOnViewTypeEvent(
              state.browser.keys?.viewType,
              TelemetryEvent[`BROWSER_JSON_PROPERTY_${isEditMode ? 'EDITED' : 'ADDED'}`],
              TelemetryEvent[`TREE_VIEW_JSON_PROPERTY_${isEditMode ? 'EDITED' : 'ADDED'}`],
            ),
            eventData: {
              databaseId: state.connections.instances?.connectedInstance?.id,
              keyLevel: getJsonPathLevel(path),
            }
          })
        } catch (error) {
          // console.log(error)
        }

        dispatch(setReJSONDataSuccess())
        dispatch<any>(fetchReJSON(key, '.'))
        dispatch<any>(refreshKeyInfoAction(key))
        onSuccessAction?.()
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(setReJSONDataFailure(errorMessage))
      dispatch(addErrorNotification(error))
      onFailAction?.()
    }
  }
}

// Asynchronous thunk action
export function appendReJSONArrayItemAction(
  key: string,
  path: string,
  data: string
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(appendReJSONArrayItem())

    try {
      const state = stateInit()
      const { status } = await apiService.patch<GetRejsonRlResponseDto>(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          ApiEndpoints.REJSON_ARRAPPEND
        ),
        {
          keyName: key,
          path,
          data: [data],
        }
      )

      if (isStatusSuccessful(status)) {
        const keyLevel = path === '.' ? '0' : getJsonPathLevel(`${path}[0]`)
        sendEventTelemetry({
          event: getBasedOnViewTypeEvent(
            state.browser.keys?.viewType,
            TelemetryEvent.BROWSER_JSON_PROPERTY_ADDED,
            TelemetryEvent.TREE_VIEW_JSON_PROPERTY_ADDED
          ),
          eventData: {
            databaseId: state.connections.instances?.connectedInstance?.id,
            keyLevel
          }
        })
        dispatch(appendReJSONArrayItemSuccess())
        dispatch<any>(fetchReJSON(key, '.'))
        dispatch<any>(refreshKeyInfoAction(key))
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(appendReJSONArrayItemFailure(errorMessage))
      dispatch(addErrorNotification(error))
    }
  }
}

// Asynchronous thunk action
export function removeReJSONKeyAction(
  key: string,
  path = '.',
  jsonKeyName = ''
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(removeRejsonKey())

    try {
      const state = stateInit()
      const { status } = await apiService.delete<RemoveRejsonRlResponse>(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          ApiEndpoints.REJSON
        ),
        {
          data: {
            keyName: key,
            path,
          },
        }
      )

      if (isStatusSuccessful(status)) {
        sendEventTelemetry({
          event: getBasedOnViewTypeEvent(
            state.browser.keys?.viewType,
            TelemetryEvent.BROWSER_JSON_PROPERTY_DELETED,
            TelemetryEvent.TREE_VIEW_JSON_PROPERTY_DELETED
          ),
          eventData: {
            databaseId: state.connections.instances?.connectedInstance?.id,
            keyLevel: getJsonPathLevel(path),
          }
        })
        dispatch(removeRejsonKeySuccess())
        dispatch<any>(fetchReJSON(key, '.'))
        dispatch<any>(refreshKeyInfoAction(key))
        dispatch(
          addMessageNotification(
            successMessages.REMOVED_KEY_VALUE(key, jsonKeyName, 'JSON key')
          )
        )
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(removeRejsonKeyFailure(errorMessage))
      dispatch(addErrorNotification(error))
    }
  }
}

// Asynchronous thunk action
export function fetchVisualisationResults(path = '.', forceRetrieve = false) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    try {
      sourceRejson?.cancel()

      const { CancelToken } = axios
      sourceRejson = CancelToken.source()

      const state = stateInit()
      const { encoding } = state.app.info
      const key = state.browser.keys?.selectedKey?.data?.name
      const { data, status } = await apiService.post<GetRejsonRlResponseDto>(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          ApiEndpoints.REJSON_GET
        ),
        {
          keyName: key,
          path,
          forceRetrieve,
          encoding,
        },
        { cancelToken: sourceRejson.token }
      )

      sourceRejson = null
      if (isStatusSuccessful(status)) {
        return data
      }
      throw new Error(data.toString())
    } catch (error) {
      if (!axios.isCancel(error)) {
        const errorMessage = getApiErrorMessage(error)
        dispatch(loadRejsonBranchFailure(errorMessage))
        dispatch(addErrorNotification(error))
      }
    }

    return null
  }
}
