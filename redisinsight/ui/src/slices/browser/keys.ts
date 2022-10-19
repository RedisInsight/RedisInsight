import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { cloneDeep, remove, get, isUndefined } from 'lodash'
import axios, { AxiosError, CancelTokenSource } from 'axios'
import { apiService, localStorageService } from 'uiSrc/services'
import { ApiEndpoints, BrowserStorageItem, KeyTypes, KeyValueFormat, SortOrder } from 'uiSrc/constants'
import {
  getApiErrorMessage,
  isStatusNotFoundError,
  Nullable,
  parseKeysListResponse,
  getUrl,
  isStatusSuccessful,
  Maybe,
  bufferToString,
  isEqualBuffers
} from 'uiSrc/utils'
import { DEFAULT_SEARCH_MATCH, SCAN_COUNT_DEFAULT } from 'uiSrc/constants/api'
import { getBasedOnViewTypeEvent, sendEventTelemetry, TelemetryEvent, getAdditionalAddedEventData, getMatchType } from 'uiSrc/telemetry'
import successMessages from 'uiSrc/components/notifications/success-messages'
import { IKeyPropTypes } from 'uiSrc/constants/prop-types/keys'

import {
  CreateListWithExpireDto,
  SetStringWithExpireDto,
  CreateZSetWithExpireDto,
  CreateHashWithExpireDto,
  CreateRejsonRlWithExpireDto,
  CreateSetWithExpireDto,
  GetKeyInfoResponse,
} from 'apiSrc/modules/browser/dto'
import { CreateStreamDto } from 'apiSrc/modules/browser/dto/stream.dto'

import { fetchString } from './string'
import { setZsetInitialState, fetchZSetMembers } from './zset'
import { fetchSetMembers } from './set'
import { fetchReJSON } from './rejson'
import { setHashInitialState, fetchHashFields } from './hash'
import { setListInitialState, fetchListElements } from './list'
import { fetchStreamEntries, setStreamInitialState } from './stream'
import { addErrorNotification, addMessageNotification } from '../app/notifications'
import { KeysStore, KeyViewType } from '../interfaces/keys'
import { AppDispatch, RootState } from '../store'
import { StreamViewType } from '../interfaces/stream'
import { RedisResponseBuffer } from '../interfaces'

const defaultViewFormat = KeyValueFormat.Unicode

export const initialState: KeysStore = {
  loading: false,
  error: '',
  filter: null,
  search: '',
  isSearched: false,
  isFiltered: false,
  isBrowserFullScreen: false,
  viewType: localStorageService?.get(BrowserStorageItem.browserViewType) ?? KeyViewType.Browser,
  data: {
    total: 0,
    scanned: 0,
    nextCursor: '0',
    keys: [],
    shardsMeta: {},
    previousResultCount: 0,
    lastRefreshTime: null,
  },
  selectedKey: {
    loading: false,
    refreshing: false,
    lastRefreshTime: null,
    error: '',
    data: null,
    length: 0,
    viewFormat: localStorageService?.get(BrowserStorageItem.viewFormat) ?? defaultViewFormat,
  },
  addKey: {
    loading: false,
    error: '',
  },
}

export const initialKeyInfo = {
  ttl: -1,
  name: null,
  nameString: null,
  type: KeyTypes.String,
  size: 1,
  length: 0,
}

const getInitialSelectedKeyState = (state: KeysStore) =>
  ({ ...initialState.selectedKey, viewFormat: state.selectedKey.viewFormat })

// A slice for recipes
const keysSlice = createSlice({
  name: 'keys',
  initialState,
  reducers: {
    // load Keys
    loadKeys: (state) => {
      state.loading = true
      state.error = ''
    },
    loadKeysSuccess: (state, { payload: { data, isSearched, isFiltered } }) => {
      state.data = {
        ...data,
        previousResultCount: data.keys?.length,
      }
      state.loading = false
      state.isSearched = isSearched
      state.isFiltered = isFiltered
      state.data.lastRefreshTime = Date.now()
    },
    loadKeysFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },

    // load more Keys for infinity scroll
    loadMoreKeys: (state) => {
      state.loading = true
      state.error = ''
    },
    loadMoreKeysSuccess: (state, { payload: { total, scanned, nextCursor, keys, shardsMeta } }) => {
      state.data.keys = keys
      state.data.total = total
      state.data.scanned = scanned
      state.data.nextCursor = nextCursor
      state.data.shardsMeta = shardsMeta
      state.data.previousResultCount = keys.length

      state.loading = false
    },
    loadMoreKeysFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },

    setLastBatchKeys: (state, { payload }) => {
      const newKeys = state.data.keys
      newKeys.splice(-payload.length, payload.length, ...payload)
      state.data.keys = newKeys
    },

    loadKeyInfoSuccess: (state, { payload }) => {
      state.selectedKey = {
        ...state.selectedKey,
        loading: false,
        data: {
          ...payload,
          nameString: bufferToString(payload.name),
        },
      }
    },
    refreshKeyInfo: (state) => {
      state.selectedKey = {
        ...state.selectedKey,
        refreshing: true,
      }
    },
    refreshKeyInfoSuccess: (state, { payload }) => {
      state.selectedKey = {
        ...state.selectedKey,
        data: { ...state.selectedKey.data, ...payload },
        refreshing: false,
      }
    },
    refreshKeyInfoFail: (state) => {
      state.selectedKey = {
        ...state.selectedKey,
        refreshing: false,
      }
    },
    updateSelectedKeyRefreshTime: (state, { payload }) => {
      state.selectedKey.lastRefreshTime = payload
    },
    // delete Key
    deleteKey: (state) => {
      state.selectedKey = {
        ...state.selectedKey,
        loading: true,
        error: '',
      }
    },
    deleteKeySuccess: (state) => {
      state.selectedKey = {
        ...state.selectedKey,
        loading: false,
        data: null,
      }
    },
    deleteKeyFailure: (state, { payload }) => {
      state.selectedKey = {
        ...state.selectedKey,
        loading: false,
        error: payload,
      }
    },
    deleteKeyFromList: (state, { payload }) => {
      remove(state.data?.keys, (key) => isEqualBuffers(key.name, payload))

      state.data = {
        ...state.data,
        total: state.data.total - 1,
        scanned: state.data.scanned - 1,
      }
    },

    // edit TTL or Key actions
    defaultSelectedKeyAction: (state) => {
      state.selectedKey = {
        ...state.selectedKey,
        loading: true,
        error: '',
      }
    },
    defaultSelectedKeyActionSuccess: (state) => {
      state.selectedKey = {
        ...state.selectedKey,
        loading: false,
        // data: null,
      }
    },
    defaultSelectedKeyActionFailure: (state, { payload }) => {
      state.selectedKey = {
        ...state.selectedKey,
        loading: false,
        error: payload,
      }
    },
    editKeyTTLFromList: (state, { payload }) => {
      const keys = state.data.keys.map((key) => {
        if (isEqualBuffers(key.name, payload?.key)) {
          key.ttl = payload?.ttl
        }
        return key
      })

      state.data = {
        ...state.data,
        keys,
      }
    },
    editKeyFromList: (state, { payload }) => {
      const keys = state.data.keys.map((key) => {
        if (isEqualBuffers(key.name, payload?.key)) {
          key.name = payload?.newKey
        }
        return key
      })

      state.data = {
        ...state.data,
        keys,
      }
    },
    updateKeySizeFromList: (state, { payload }) => {
      const keys = state.data.keys.map((key) => {
        if (isEqualBuffers(key.name, payload?.key)) {
          key.size = payload?.size
        }
        return key
      })

      state.data = {
        ...state.data,
        keys,
      }
    },

    // update length for Selected Key
    updateSelectedKeyLength: (state, { payload }) => {
      state.selectedKey = {
        ...state.selectedKey,
        data: {
          ...state.selectedKey.data,
          length: payload,
        },
      }
    },

    // Add Key
    addKey: (state) => {
      state.addKey = {
        ...state.addKey,
        loading: true,
        error: '',
      }
    },
    addKeySuccess: (state) => {
      state.addKey = {
        ...state.addKey,
        loading: false,
      }
    },
    addKeyFailure: (state, { payload }) => {
      state.addKey = {
        ...state.addKey,
        loading: false,
        error: payload,
      }
    },

    setSearchMatch: (state, { payload }) => {
      state.search = payload
    },
    setFilter: (state, { payload }) => {
      state.filter = payload
    },

    changeKeyViewType: (state, { payload }:{ payload: KeyViewType }) => {
      state.viewType = payload
    },

    resetAddKey: (state) => {
      state.addKey = cloneDeep(initialState.addKey)
    },

    resetKeyInfo: (state) => {
      state.selectedKey = cloneDeep(getInitialSelectedKeyState(state as KeysStore))
    },

    // reset keys for keys slice
    resetKeys: (state) => cloneDeep(
      {
        ...initialState,
        viewType: localStorageService?.get(BrowserStorageItem.browserViewType) ?? KeyViewType.Browser,
        selectedKey: getInitialSelectedKeyState(state as KeysStore)
      }
    ),

    resetKeysData: (state) => {
      // state.data.keys = []
      state.data.keys.length = 0
    },

    toggleBrowserFullScreen: (state, { payload }: { payload: Maybe<boolean> }) => {
      if (!isUndefined(payload)) {
        state.isBrowserFullScreen = payload
        return
      }
      state.isBrowserFullScreen = !state.isBrowserFullScreen
    },

    setViewFormat: (state, { payload }: PayloadAction<KeyValueFormat>) => {
      state.selectedKey.viewFormat = payload
      localStorageService?.set(BrowserStorageItem.viewFormat, payload)
    }
  },
})

// Actions generated from the slice
export const {
  loadKeys,
  loadKeysSuccess,
  loadKeysFailure,
  loadMoreKeys,
  loadMoreKeysSuccess,
  loadMoreKeysFailure,
  loadKeyInfoSuccess,
  updateSelectedKeyRefreshTime,
  refreshKeyInfo,
  refreshKeyInfoSuccess,
  refreshKeyInfoFail,
  defaultSelectedKeyAction,
  defaultSelectedKeyActionSuccess,
  defaultSelectedKeyActionFailure,
  setLastBatchKeys,
  addKey,
  addKeySuccess,
  addKeyFailure,
  resetAddKey,
  deleteKey,
  deleteKeySuccess,
  deleteKeyFailure,
  deleteKeyFromList,
  editKeyTTLFromList,
  editKeyFromList,
  updateKeySizeFromList,
  updateSelectedKeyLength,
  setSearchMatch,
  setFilter,
  changeKeyViewType,
  resetKeyInfo,
  resetKeys,
  resetKeysData,
  toggleBrowserFullScreen,
  setViewFormat,
} = keysSlice.actions

// A selector
export const keysSelector = (state: RootState) => state.browser.keys
export const keysDataSelector = (state: RootState) => state.browser.keys.data
export const selectedKeySelector = (state: RootState) => state.browser.keys?.selectedKey
export const selectedKeyDataSelector = (state: RootState) => state.browser.keys?.selectedKey?.data
export const addKeyStateSelector = (state: RootState) => state.browser.keys?.addKey

// The reducer
export default keysSlice.reducer

// eslint-disable-next-line import/no-mutable-exports
export let sourceKeysFetch: Nullable<CancelTokenSource> = null

export function setInitialStateByType(type: string) {
  return (dispatch: AppDispatch) => {
    if (type === KeyTypes.Hash) {
      dispatch(setHashInitialState())
    }
    if (type === KeyTypes.List) {
      dispatch(setListInitialState())
    }
    if (type === KeyTypes.ZSet) {
      dispatch(setZsetInitialState())
    }
    if (type === KeyTypes.Stream) {
      dispatch(setStreamInitialState())
    }
  }
}
// Asynchronous thunk action
export function fetchKeys(cursor: string, count: number, onSuccess?: () => void, onFailed?: () => void) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(loadKeys())

    try {
      sourceKeysFetch?.cancel?.()

      const { CancelToken } = axios
      sourceKeysFetch = CancelToken.source()

      const state = stateInit()
      const { search: match, filter: type } = state.browser.keys
      const { encoding } = state.app.info

      const { data, status } = await apiService.post<GetKeyInfoResponse[]>(
        getUrl(
          state.connections.instances?.connectedInstance?.id ?? '',
          ApiEndpoints.KEYS
        ),
        {
          cursor, count, type, match: match || DEFAULT_SEARCH_MATCH, keysInfo: false,
        },
        {
          params: { encoding },
          cancelToken: sourceKeysFetch.token,
        },
      )

      sourceKeysFetch = null
      if (isStatusSuccessful(status)) {
        dispatch(
          loadKeysSuccess({
            data: parseKeysListResponse({}, data),
            isSearched: !!match,
            isFiltered: !!type,
          })
        )
        if (!!type || !!match) {
          let matchValue = '*'
          if (match !== '*' && !!match) {
            matchValue = getMatchType(match)
          }
          sendEventTelemetry({
            event: getBasedOnViewTypeEvent(
              state.browser.keys?.viewType,
              TelemetryEvent.BROWSER_KEYS_SCANNED_WITH_FILTER_ENABLED,
              TelemetryEvent.TREE_VIEW_KEYS_SCANNED_WITH_FILTER_ENABLED
            ),
            eventData: {
              databaseId: state.connections.instances?.connectedInstance?.id,
              keyType: type,
              match: matchValue,
              databaseSize: data[0].total,
              numberOfKeysScanned: data[0].scanned,
              scanCount: count,
            }
          })
        }
        if (!type && !match && cursor === '0') {
          sendEventTelemetry({
            event: getBasedOnViewTypeEvent(
              state.browser.keys?.viewType,
              TelemetryEvent.BROWSER_KEYS_SCANNED,
              TelemetryEvent.TREE_VIEW_KEYS_SCANNED
            ),
            eventData: {
              databaseId: state.connections.instances?.connectedInstance?.id,
              databaseSize: data[0].total,
              numberOfKeysScanned: data[0].scanned,
              scanCount: count,
            }
          })
        }
        onSuccess?.()
      }
    } catch (error) {
      if (!axios.isCancel(error)) {
        const errorMessage = getApiErrorMessage(error)
        dispatch(addErrorNotification(error))
        dispatch(loadKeysFailure(errorMessage))
        onFailed?.()
      }
    }
  }
}

// Asynchronous thunk action
export function fetchMoreKeys(oldKeys: IKeyPropTypes[] = [], cursor: string, count: number) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(loadMoreKeys())

    try {
      sourceKeysFetch?.cancel?.()

      const { CancelToken } = axios
      sourceKeysFetch = CancelToken.source()

      const state = stateInit()
      const { search: match, filter: type } = state.browser.keys
      const { encoding } = state.app.info
      const { data, status } = await apiService.post(
        getUrl(
          state.connections.instances?.connectedInstance?.id ?? '',
          ApiEndpoints.KEYS
        ),
        {
          cursor, count, type, match: match || DEFAULT_SEARCH_MATCH, keysInfo: false,
        },
        {
          params: { encoding },
          cancelToken: sourceKeysFetch.token,
        },
      )

      sourceKeysFetch = null
      if (isStatusSuccessful(status)) {
        const newKeysData = parseKeysListResponse(state.browser.keys.data.shardsMeta, data)
        dispatch(loadMoreKeysSuccess({
          ...newKeysData,
          keys: oldKeys.concat(newKeysData.keys)
        }))
        sendEventTelemetry({
          event: getBasedOnViewTypeEvent(
            state.browser.keys?.viewType,
            TelemetryEvent.BROWSER_KEYS_ADDITIONALLY_SCANNED,
            TelemetryEvent.TREE_VIEW_KEYS_ADDITIONALLY_SCANNED
          ),
          eventData: {
            databaseId: state.connections.instances?.connectedInstance?.id,
            databaseSize: data[0].total,
            numberOfKeysScanned: state.browser.keys.data.scanned + data[0].scanned,
            scanCount: count,
          }
        })
      }
    } catch (error) {
      if (!axios.isCancel(error)) {
        const errorMessage = getApiErrorMessage(error)
        dispatch(addErrorNotification(error))
        dispatch(loadMoreKeysFailure(errorMessage))
      }
    }
  }
}

// Asynchronous thunk action
export function fetchKeyInfo(key: RedisResponseBuffer, resetData?: boolean) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(defaultSelectedKeyAction())

    try {
      const state = stateInit()
      const { encoding } = state.app.info
      const { data, status } = await apiService.post(
        getUrl(
          state.connections.instances?.connectedInstance?.id ?? '',
          ApiEndpoints.KEY_INFO
        ),
        { keyName: key },
        { params: { encoding } }
      )

      if (isStatusSuccessful(status)) {
        dispatch(loadKeyInfoSuccess(data))
        dispatch(updateSelectedKeyRefreshTime(Date.now()))
        if (isEqualBuffers(state.browser.keys.selectedKey?.data?.name, key)) {
          dispatch(updateKeySizeFromList({ key, size: data?.size }))
        }
      }

      if (data.type === KeyTypes.Hash) {
        dispatch<any>(fetchHashFields(key, 0, SCAN_COUNT_DEFAULT, '*', resetData))
      }
      if (data.type === KeyTypes.List) {
        dispatch<any>(fetchListElements(key, 0, SCAN_COUNT_DEFAULT, resetData))
      }
      if (data.type === KeyTypes.String) {
        dispatch<any>(fetchString(key, resetData))
      }
      if (data.type === KeyTypes.ZSet) {
        dispatch<any>(
          fetchZSetMembers(key, 0, SCAN_COUNT_DEFAULT, SortOrder.ASC, resetData)
        )
      }
      if (data.type === KeyTypes.Set) {
        dispatch<any>(fetchSetMembers(key, 0, SCAN_COUNT_DEFAULT, '*', resetData))
      }
      if (data.type === KeyTypes.ReJSON) {
        dispatch<any>(fetchReJSON(key, '.', resetData))
      }
      if (data.type === KeyTypes.Stream) {
        const { viewType } = state.browser.stream

        if (viewType === StreamViewType.Data) {
          dispatch<any>(fetchStreamEntries(
            key,
            SCAN_COUNT_DEFAULT,
            SortOrder.DESC,
            resetData
          ))
        }
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(defaultSelectedKeyActionFailure(errorMessage))
    }
  }
}

// Asynchronous thunk action
export function refreshKeyInfoAction(key: RedisResponseBuffer) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(refreshKeyInfo())
    try {
      const state = stateInit()
      const { encoding } = state.app.info
      const { data, status } = await apiService.post(
        getUrl(
          state.connections.instances?.connectedInstance?.id ?? '',
          ApiEndpoints.KEY_INFO
        ),
        { keyName: key },
        { params: { encoding } }
      )
      if (isStatusSuccessful(status)) {
        dispatch(refreshKeyInfoSuccess(data))
        dispatch(updateSelectedKeyRefreshTime(Date.now()))
        if (isEqualBuffers(state.browser.keys.selectedKey?.data?.name, key)) {
          dispatch(updateKeySizeFromList({ key, size: data?.size }))
        }
      }
    } catch (error) {
      dispatch(refreshKeyInfoFail())
      dispatch(addErrorNotification(error))
      if (isStatusNotFoundError(get(error, ['response', 'status']))) {
        dispatch(resetKeyInfo())
        dispatch(deleteKeyFromList(key))
      }
    }
  }
}

function addTypedKey(
  data: any,
  endpoint: ApiEndpoints,
  onSuccessAction?: () => void,
  onFailAction?: () => void
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(addKey())
    try {
      const state = stateInit()
      const { encoding } = state.app.info
      const { status } = await apiService.post(
        getUrl(state.connections.instances?.connectedInstance?.id ?? '', endpoint),
        data,
        { params: { encoding } },
      )
      if (isStatusSuccessful(status)) {
        const additionalData = getAdditionalAddedEventData(endpoint, data)
        if (onSuccessAction) {
          onSuccessAction()
        }
        dispatch(addKeySuccess())
        dispatch(
          addMessageNotification(successMessages.ADDED_NEW_KEY(data.keyName))
        )
        sendEventTelemetry({
          event: getBasedOnViewTypeEvent(
            state.browser.keys?.viewType,
            TelemetryEvent.BROWSER_KEY_ADDED,
            TelemetryEvent.TREE_VIEW_KEY_ADDED
          ),
          eventData: {
            databaseId: state.connections.instances?.connectedInstance?.id,
            ...additionalData
          }
        })
      }
    } catch (error) {
      if (onFailAction) {
        onFailAction()
      }
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(addKeyFailure(errorMessage))
    }
  }
}

// Asynchronous thunk action
export function addHashKey(
  data: CreateHashWithExpireDto,
  onSuccessAction?: () => void,
  onFailAction?: () => void
) {
  const endpoint = ApiEndpoints.HASH
  return addTypedKey(data, endpoint, onSuccessAction, onFailAction)
}

// Asynchronous thunk action
export function addZsetKey(
  data: CreateZSetWithExpireDto,
  onSuccessAction?: () => void,
  onFailAction?: () => void
) {
  const endpoint = ApiEndpoints.ZSET
  return addTypedKey(data, endpoint, onSuccessAction, onFailAction)
}

// Asynchronous thunk action
export function addSetKey(
  data: CreateSetWithExpireDto,
  onSuccessAction?: () => void,
  onFailAction?: () => void
) {
  const endpoint = ApiEndpoints.SET
  return addTypedKey(data, endpoint, onSuccessAction, onFailAction)
}

// Asynchronous thunk action
export function addStringKey(
  data: SetStringWithExpireDto,
  onSuccessAction?: () => void,
  onFailAction?: () => void
) {
  const endpoint = ApiEndpoints.STRING
  return addTypedKey(data, endpoint, onSuccessAction, onFailAction)
}

// Asynchronous thunk action
export function addListKey(
  data: CreateListWithExpireDto,
  onSuccessAction?: () => void,
  onFailAction?: () => void
) {
  const endpoint = ApiEndpoints.LIST
  return addTypedKey(data, endpoint, onSuccessAction, onFailAction)
}

// Asynchronous thunk action
export function addReJSONKey(
  data: CreateRejsonRlWithExpireDto,
  onSuccessAction?: () => void,
  onFailAction?: () => void
) {
  const endpoint = ApiEndpoints.REJSON
  return addTypedKey(data, endpoint, onSuccessAction, onFailAction)
}

// Asynchronous thunk action
export function addStreamKey(
  data: CreateStreamDto,
  onSuccessAction?: () => void,
  onFailAction?: () => void
) {
  const endpoint = ApiEndpoints.STREAMS
  return addTypedKey(data, endpoint, onSuccessAction, onFailAction)
}

// Asynchronous thunk action
export function deleteKeyAction(key: RedisResponseBuffer, onSuccessAction?: () => void) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(deleteKey())

    try {
      const state = stateInit()
      const { encoding } = state.app.info
      const { status } = await apiService.delete(
        getUrl(
          state.connections.instances?.connectedInstance?.id ?? '',
          ApiEndpoints.KEYS
        ),
        {
          data: { keyNames: [key] },
          params: { encoding },
        }
      )

      if (isStatusSuccessful(status)) {
        sendEventTelemetry({
          event: getBasedOnViewTypeEvent(
            state.browser.keys?.viewType,
            TelemetryEvent.BROWSER_KEYS_DELETED,
            TelemetryEvent.TREE_VIEW_KEYS_DELETED
          ),
          eventData: {
            databaseId: state.connections.instances?.connectedInstance?.id,
            numberOfDeletedKeys: 1
          }
        })
        dispatch(deleteKeySuccess())
        dispatch(deleteKeyFromList(key))
        onSuccessAction?.()
        dispatch(addMessageNotification(successMessages.DELETED_KEY(key)))
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(deleteKeyFailure(errorMessage))
    }
  }
}

// Asynchronous thunk action
export function editKey(
  key: RedisResponseBuffer,
  newKey: RedisResponseBuffer,
  onSuccess?: () => void,
  onFailure?: () => void
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(defaultSelectedKeyAction())

    try {
      const state = stateInit()
      const { encoding } = state.app.info
      const { status } = await apiService.patch(
        getUrl(
          state.connections.instances?.connectedInstance?.id ?? '',
          ApiEndpoints.KEY_NAME
        ),
        { keyName: key, newKeyName: newKey },
        { params: { encoding } },
      )

      if (isStatusSuccessful(status)) {
        dispatch(editKeyFromList({ key, newKey }))
        onSuccess?.()
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(defaultSelectedKeyActionFailure(errorMessage))
      onFailure?.()
    }
  }
}

// Asynchronous thunk action
export function editKeyTTL(key: string, ttl: number) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(defaultSelectedKeyAction())

    try {
      const state = stateInit()
      const { encoding } = state.app.info
      const { status } = await apiService.patch(
        getUrl(
          state.connections.instances?.connectedInstance?.id ?? '',
          ApiEndpoints.KEY_TTL
        ),
        { keyName: key, ttl },
        { params: { encoding } }
      )
      if (isStatusSuccessful(status)) {
        sendEventTelemetry({
          event: getBasedOnViewTypeEvent(
            state.browser.keys?.viewType,
            TelemetryEvent.BROWSER_KEY_TTL_CHANGED,
            TelemetryEvent.TREE_VIEW_KEY_TTL_CHANGED
          ),
          eventData: {
            databaseId: state.connections.instances?.connectedInstance?.id,
            ttl: ttl >= 0 ? ttl : -1,
            previousTTL: state.browser.keys.selectedKey?.data?.ttl,
          }
        })
        if (ttl !== 0) {
          dispatch(editKeyTTLFromList({ key, ttl }))
          dispatch<any>(fetchKeyInfo(key))
        } else {
          dispatch(deleteKeySuccess())
          dispatch(deleteKeyFromList(key))
        }
        dispatch(defaultSelectedKeyActionSuccess())
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(defaultSelectedKeyActionFailure(errorMessage))
    }
  }
}

// Asynchronous thunk action
export function fetchKeysMetadata(
  keys: GetKeyInfoResponse[],
  onSuccessAction?: (data: GetKeyInfoResponse[]) => void,
  onFailAction?: () => void
) {
  return async (_dispatch: AppDispatch, stateInit: () => RootState) => {
    try {
      const state = stateInit()
      const { data } = await apiService.post<GetKeyInfoResponse[]>(
        getUrl(
          state.connections.instances?.connectedInstance?.id,
          ApiEndpoints.KEYS_METADATA
        ),
        { keys },
        { params: { encoding: state.app.info.encoding } }
      )

      onSuccessAction?.(data)
    } catch (error) {
      onFailAction?.()
      console.error(error)
    }
  }
}
