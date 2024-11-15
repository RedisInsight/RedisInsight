import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import axios, { AxiosError, CancelTokenSource } from 'axios'
import JSONBigInt from 'json-bigint'

import { isNumber } from 'lodash'
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

const JSON_LENGTH_TO_FORCE_RETRIEVE = 200

// Initialize parser with strict mode off to allow parsing of primitive values
const JSONParser = JSONBigInt({ 
  useNativeBigInt: true,
  strict: false  // This allows parsing of primitive values
})

const parseValue = (value: any, type?: string): any => {
  try {
    // Handle non-strings or empty values
    if (typeof value !== 'string' || !value) {
      return value;
    }

    // If type is provided, handle typed values first
    if (type) {
      switch (type) {
        case 'integer': {
          const num = BigInt(value);
          return num > Number.MAX_SAFE_INTEGER ? num : Number(value);
        }
        case 'number':
          return Number(value);
        case 'boolean':
          return value === 'true';
        case 'null':
          return null;
        default:
          return value;
      }
    }

    // If it's a typed string, return it as is
    if (type === 'string') {
      // Handle string values (both typed and untyped)
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      return value;
    }

    // Try parsing as JSON for nested structures
    try {
      const parsed = JSONParser.parse(value);
      
      if (typeof parsed === 'object' && parsed !== null) {
        if (Array.isArray(parsed)) {
          return parsed.map(val => parseValue(val));
        }
        const result: { [key: string]: any } = {};
        Object.entries(parsed).forEach(([key, val]) => {
          result[key] = parseValue(val);
        });
        return result;
      }
      return parsed;
    } catch {
      // If JSON parsing fails, return the processed string
      return value;
    }
  } catch (e) {
    return value;
  }
};

const parseJsonData = (data: any) => {
  try {
    // Handle array of objects with metadata (from BE)
    if (data?.data && Array.isArray(data.data)) {
      return {
        ...data,
        data: data.data.map((item: { type?: string; value?: any }) => ({
          ...item,
          value: item.type && item.value ? parseValue(item.value, item.type) : item.value
        }))
      };
    }
    
    // Handle regular JSON data
    return {
      ...data,
      data: parseValue(data.data)
    };
  } catch (e) {
    console.error('Error parsing JSON data:', e);
    return data;
  }
};

const parseSimpleJsonData = (data: any) => {
  try {    
    return {
      ...data,
      data: JSONParser.parse(data.data)
    };
  } catch (e) {
    console.error('Error parsing JSON data:', e);
    return data;
  }
}

export const initialState: InitialStateRejson = {
  loading: false,
  error: null,
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
      state.error = null

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
      state.error = null
    },
    appendReJSONArrayItemSuccess: (state) => {
      state.loading = false
      state.error = null
    },
    appendReJSONArrayItemFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
    setReJSONData: (state) => {
      state.loading = true
      state.error = null
    },
    setReJSONDataSuccess: (state) => {
      state.loading = false
      state.error = null
    },
    setReJSONDataFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
    removeRejsonKey: (state) => {
      state.loading = true
      state.error = null
    },
    removeRejsonKeySuccess: (state) => {
      state.loading = false
      state.error = null
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
export function fetchReJSON(
  key: RedisResponseBuffer,
  path = '.',
  length?: number,
  resetData?: boolean,
) {
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
          forceRetrieve: isNumber(length) && length > JSON_LENGTH_TO_FORCE_RETRIEVE,
          encoding,
        },
        { cancelToken: sourceRejson.token }
      )

      sourceRejson = null
      if (isStatusSuccessful(status)) {
        dispatch(loadRejsonBranchSuccess(parseSimpleJsonData(data)))
      }
    } catch (error) {
      if (!axios.isCancel(error)) {
        const errorMessage = getApiErrorMessage(error as AxiosError)
        dispatch(loadRejsonBranchFailure(errorMessage))
        dispatch(addErrorNotification(error))
      }
    }
  }
}

// Asynchronous thunk action
export function setReJSONDataAction(
  key: RedisResponseBuffer,
  path: string,
  data: string,
  isEditMode: boolean,
  length?: number,
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
        dispatch<any>(fetchReJSON(key, '.', length))
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
  key: RedisResponseBuffer,
  path: string,
  data: string,
  length?: number
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
        dispatch<any>(fetchReJSON(key, '.', length))
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
  key: RedisResponseBuffer,
  path = '.',
  jsonKeyName = '',
  length?: number
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
        dispatch<any>(fetchReJSON(key, '.', length))
        dispatch<any>(refreshKeyInfoAction(key))
        dispatch(
          addMessageNotification(
            successMessages.REMOVED_KEY_VALUE(key, jsonKeyName, 'JSON key')
          )
        )
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error as AxiosError)
      dispatch(removeRejsonKeyFailure(errorMessage))
      dispatch(addErrorNotification(error as AxiosError))
    }
  }
}

// Asynchronous thunk action
export function fetchVisualisationResults(path = '.', forceRetrieve = false) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    try {
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
        }
      )

      if (isStatusSuccessful(status)) {     
        return parseJsonData(data)
      }
      throw new Error(data.toString())
    } catch (_err) {
      const error = _err as AxiosError
      if (!axios.isCancel(error)) {
        const errorMessage = getApiErrorMessage(error)
        dispatch(loadRejsonBranchFailure(errorMessage))
        dispatch(addErrorNotification(error))
      }
    }

    return null
  }
}
