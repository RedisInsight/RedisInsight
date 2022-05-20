import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import axios, { AxiosError, CancelTokenSource } from 'axios'

import { apiService } from 'uiSrc/services'
import { SCAN_COUNT_DEFAULT } from 'uiSrc/constants/api'
import { ApiEndpoints, SortOrder } from 'uiSrc/constants'
import { refreshKeyInfoAction, } from 'uiSrc/slices/browser/keys'
import { getApiErrorMessage, getUrl, isStatusSuccessful, Maybe, Nullable } from 'uiSrc/utils'
import { getStreamRangeStart, getStreamRangeEnd } from 'uiSrc/utils/streamUtils'
import successMessages from 'uiSrc/components/notifications/success-messages'
import {
  AddStreamEntriesDto,
  AddStreamEntriesResponse,
  GetStreamEntriesResponse,
} from 'apiSrc/modules/browser/dto/stream.dto'
import { AppDispatch, RootState } from '../store'
import { StateStream } from '../interfaces/stream'
import { addErrorNotification, addMessageNotification } from '../app/notifications'

export const initialState: StateStream = {
  loading: false,
  error: '',
  sortOrder: SortOrder.DESC,
  range: { start: '', end: '' },
  data: {
    total: 0,
    entries: [],
    keyName: '',
    lastGeneratedId: '',
    firstEntry: {
      id: '',
      fields: {}
    },
    lastEntry: {
      id: '',
      fields: {}
    },
  },
}

// A slice for recipes
const streamSlice = createSlice({
  name: 'stream',
  initialState,
  reducers: {
    // load stream entries
    loadEntries: (state, { payload: resetData = true }: PayloadAction<Maybe<boolean>>) => {
      state.loading = true
      state.error = ''

      if (resetData) {
        state.data = initialState.data
      }
    },
    loadEntriesSuccess: (state, { payload: [data, sortOrder] }:
    PayloadAction<[GetStreamEntriesResponse, SortOrder]>) => {
      state.data = {
        ...state.data,
        ...data,
      }
      state.data.keyName = data?.keyName
      state.sortOrder = sortOrder
      state.loading = false
    },
    loadEntriesFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
    // load more stream entries
    loadMoreEntries: (state) => {
      state.loading = true
      state.error = ''
    },
    loadMoreEntriesSuccess: (state, { payload: { entries, ...rest } }: PayloadAction<GetStreamEntriesResponse>) => {
      state.data = {
        ...state.data,
        ...rest,
        entries: state.data?.entries?.concat(entries),
      }
      state.loading = false
    },
    loadMoreEntriesFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
    addNewEntries: (state) => {
      state.loading = true
      state.error = ''
    },
    addNewEntriesSuccess: (state) => {
      state.loading = true
    },
    addNewEntriesFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
    // delete Stream entries
    removeStreamEntries: (state) => {
      state.loading = true
      state.error = ''
    },
    removeStreamEntriesSuccess: (state) => {
      state.loading = false
    },
    removeStreamEntriesFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
    updateStart: (state, { payload }: PayloadAction<string>) => {
      state.range.start = payload
    },
    updateEnd: (state, { payload }: PayloadAction<string>) => {
      state.range.end = payload
    },
    cleanRangeFilter: (state) => {
      state.range = {
        start: '',
        end: '',
      }
    },
  },
})

// Actions generated from the slice
export const {
  loadEntries,
  loadEntriesSuccess,
  loadEntriesFailure,
  loadMoreEntries,
  loadMoreEntriesSuccess,
  loadMoreEntriesFailure,
  addNewEntries,
  addNewEntriesSuccess,
  addNewEntriesFailure,
  removeStreamEntries,
  removeStreamEntriesSuccess,
  removeStreamEntriesFailure,
  updateStart,
  updateEnd,
  cleanRangeFilter
} = streamSlice.actions

// A selector
export const streamSelector = (state: RootState) => state.browser.stream
export const streamDataSelector = (state: RootState) => state.browser.stream?.data
export const streamRangeSelector = (state: RootState) => state.browser.stream?.range

// The reducer
export default streamSlice.reducer

// eslint-disable-next-line import/no-mutable-exports
export let sourceStreamFetch: Nullable<CancelTokenSource> = null

// Asynchronous thunk action
export function fetchStreamEntries(
  key: string,
  count: number,
  sortOrder: SortOrder,
  resetData?: boolean,
  onSuccess?: (data: GetStreamEntriesResponse) => void,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(loadEntries(resetData))

    try {
      sourceStreamFetch?.cancel?.()

      const { CancelToken } = axios
      sourceStreamFetch = CancelToken.source()

      const state = stateInit()
      const start = getStreamRangeStart(state.browser.stream.range.start, state.browser.stream.data.firstEntry?.id)
      const end = getStreamRangeEnd(state.browser.stream.range.end, state.browser.stream.data.lastEntry?.id)
      const { data, status } = await apiService.post<GetStreamEntriesResponse>(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          ApiEndpoints.STREAMS_ENTRIES_GET
        ),
        {
          keyName: key,
          start,
          end,
          count,
          sortOrder
        },
        { cancelToken: sourceStreamFetch.token }
      )

      sourceStreamFetch = null
      if (isStatusSuccessful(status)) {
        dispatch(loadEntriesSuccess([data, sortOrder]))
        onSuccess?.(data)
      }
    } catch (_err) {
      if (!axios.isCancel(_err)) {
        const error = _err as AxiosError
        const errorMessage = getApiErrorMessage(error)
        dispatch(addErrorNotification(error))
        dispatch(loadEntriesFailure(errorMessage))
      }
    }
  }
}

// Asynchronous thunk action
export function refreshStreamEntries(
  key: string,
  resetData?: boolean,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(loadEntries(resetData))

    try {
      sourceStreamFetch?.cancel?.()

      const { CancelToken } = axios
      sourceStreamFetch = CancelToken.source()

      const state = stateInit()
      const { sortOrder } = state.browser.stream
      const start = getStreamRangeStart(state.browser.stream.range.start, state.browser.stream.data.firstEntry?.id)
      const end = getStreamRangeEnd(state.browser.stream.range.end, state.browser.stream.data.lastEntry?.id)
      const { data, status } = await apiService.post<GetStreamEntriesResponse>(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          ApiEndpoints.STREAMS_ENTRIES_GET
        ),
        {
          keyName: key,
          start,
          end,
          sortOrder,
          count: SCAN_COUNT_DEFAULT,
        },
        { cancelToken: sourceStreamFetch.token }
      )

      sourceStreamFetch = null
      if (isStatusSuccessful(status)) {
        dispatch(loadEntriesSuccess([data, sortOrder]))
      }
    } catch (_err) {
      if (!axios.isCancel(_err)) {
        const error = _err as AxiosError
        const errorMessage = getApiErrorMessage(error)
        dispatch(addErrorNotification(error))
        dispatch(loadEntriesFailure(errorMessage))
      }
    }
  }
}

// Asynchronous thunk action
export function fetchMoreStreamEntries(
  key: string,
  start: string,
  end: string,
  count: number,
  sortOrder: SortOrder,
  onSuccess?: (data: GetStreamEntriesResponse) => void,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(loadMoreEntries())

    try {
      sourceStreamFetch?.cancel?.()

      const { CancelToken } = axios
      sourceStreamFetch = CancelToken.source()
      const state = stateInit()
      const { data, status } = await apiService.post<GetStreamEntriesResponse>(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          ApiEndpoints.STREAMS_ENTRIES_GET
        ),
        {
          keyName: key,
          start,
          end,
          count,
          sortOrder
        },
        { cancelToken: sourceStreamFetch.token }
      )

      sourceStreamFetch = null
      if (isStatusSuccessful(status)) {
        dispatch(loadMoreEntriesSuccess(data))
        onSuccess?.(data)
      }
    } catch (_err) {
      if (!axios.isCancel(_err)) {
        const error = _err as AxiosError
        const errorMessage = getApiErrorMessage(error)
        dispatch(addErrorNotification(error))
        dispatch(loadMoreEntriesFailure(errorMessage))
      }
    }
  }
}

// Asynchronous thunk action
export function addNewEntriesAction(
  data: AddStreamEntriesDto,
  onSuccess?: () => void,
  onFail?: () => void
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(addNewEntries())

    try {
      const state = stateInit()
      const { status } = await apiService.post<AddStreamEntriesResponse>(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          ApiEndpoints.STREAMS_ENTRIES
        ),
        data
      )

      if (isStatusSuccessful(status)) {
        dispatch(addNewEntriesSuccess())
        dispatch<any>(refreshStreamEntries(data.keyName, false))
        dispatch<any>(refreshKeyInfoAction(data.keyName))
        onSuccess?.()
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(addNewEntriesFailure(errorMessage))
      onFail?.()
    }
  }
}
// Asynchronous thunk actions
export function deleteStreamEntry(key: string, entries: string[]) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(removeStreamEntries())
    try {
      const state = stateInit()
      const { status } = await apiService.delete(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          ApiEndpoints.STREAMS_ENTRIES
        ),
        {
          data: {
            keyName: key,
            entries,
          },
        }
      )
      if (isStatusSuccessful(status)) {
        dispatch(removeStreamEntriesSuccess())
        dispatch<any>(refreshStreamEntries(key, false))
        dispatch<any>(refreshKeyInfoAction(key))
        dispatch(addMessageNotification(
          successMessages.REMOVED_KEY_VALUE(
            key,
            entries.join(''),
            'Entry'
          )
        ))
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(removeStreamEntriesFailure(errorMessage))
    }
  }
}
