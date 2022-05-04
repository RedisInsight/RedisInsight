import { createSlice } from '@reduxjs/toolkit'
import { AxiosError } from 'axios'

import { ApiEndpoints, SortOrder } from 'uiSrc/constants'
import { apiService } from 'uiSrc/services'
import { getApiErrorMessage, getUrl, isStatusSuccessful } from 'uiSrc/utils'
import { GetStreamEntriesResponse } from 'apiSrc/modules/browser/dto/stream.dto'
import { addErrorNotification } from '../app/notifications'
import { StateStream } from '../interfaces/stream'
import { AppDispatch, RootState } from '../store'

export const initialState: StateStream = {
  loading: false,
  error: '',
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
    loadEntries: (state) => {
      state.loading = true
      state.error = ''
      state.data = initialState.data
    },
    loadEntriesSuccess: (state, { payload }: { payload: GetStreamEntriesResponse }) => {
      state.data = {
        ...state.data,
        ...payload,
      }
      state.data.keyName = payload.keyName
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
    loadMoreEntriesSuccess: (state, { payload: { entries, ...rest } }: { payload: GetStreamEntriesResponse }) => {
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
} = streamSlice.actions

// A selector
export const streamSelector = (state: RootState) => state.browser.stream
export const streamDataSelector = (state: RootState) => state.browser.stream?.data

// The reducer
export default streamSlice.reducer

// Asynchronous thunk action
export function fetchStreamEntries(
  key: string,
  count: number,
  sortOrder: SortOrder,
  onSuccess?: (data: GetStreamEntriesResponse) => void,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(loadEntries())

    const start = '-'
    const end = '+'

    try {
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
        }
      )

      if (isStatusSuccessful(status)) {
        dispatch(loadEntriesSuccess(data))
        onSuccess?.(data)
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(loadEntriesFailure(errorMessage))
    }
  }
}

// Asynchronous thunk action
export function fetchMoreStreamEntries(
  key: string,
  id: string,
  count: number,
  sortOrder: SortOrder,
  onSuccess?: (data: GetStreamEntriesResponse) => void,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(loadMoreEntries())

    const start = sortOrder === SortOrder.DESC ? '-' : id
    const end = sortOrder === SortOrder.DESC ? id : '+'

    try {
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
        }
      )

      if (isStatusSuccessful(status)) {
        dispatch(loadMoreEntriesSuccess(data))
        onSuccess?.(data)
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(loadMoreEntriesFailure(errorMessage))
    }
  }
}
