import { AxiosError } from 'axios'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import successMessages from 'uiSrc/components/notifications/success-messages'

import { ApiEndpoints } from 'uiSrc/constants'
import { apiService } from 'uiSrc/services'
import { getApiErrorMessage, getUrl, isStatusSuccessful } from 'uiSrc/utils'
import { DEFAULT_SEARCH_MATCH } from 'uiSrc/constants/api'

import { GetKeysWithDetailsResponse } from 'apiSrc/modules/browser/dto'
import { CreateRedisearchIndexDto } from 'apiSrc/modules/browser/dto/redisearch'

import { AppDispatch, RootState } from '../store'
import { RedisResponseBuffer, StateRedisearch } from '../interfaces'
import { addErrorNotification, addMessageNotification } from '../app/notifications'

export const initialState: StateRedisearch = {
  loading: false,
  error: '',
  search: '',
  selectedIndex: null,
  data: {
    total: 0,
    scanned: 0,
    nextCursor: '0',
    keys: [],
    shardsMeta: {},
    previousResultCount: 0,
    lastRefreshTime: null,
  },
  list: {
    loading: false,
    error: '',
    data: []
  },
  createIndex: {
    loading: false,
    error: '',
  },
}

// A slice for recipes
const redisearchSlice = createSlice({
  name: 'redisearch',
  initialState,
  reducers: {
    setRedisearchInitialState: () => initialState,

    // load redisearch keys
    loadKeys: (state) => {
      state.list = {
        ...state.list,
        loading: true,
        error: '',
      }
    },
    loadKeysSuccess: (state, { payload }: PayloadAction<GetKeysWithDetailsResponse>) => {
      state.data = {
        ...payload
      }
    },
    loadKeysFailure: (state, { payload }) => {
      state.list = {
        ...state.list,
        loading: false,
        error: payload,
      }
    },

    // load more redisearch keys
    loadMoreKeys: (state) => {
      state.list = {
        ...state.list,
        loading: true,
        error: '',
      }
    },
    loadMoreKeysSuccess: (state, { payload }: PayloadAction<GetKeysWithDetailsResponse>) => {
      state.list = {
        ...state.list,
        loading: false,
        data: payload,
      }
    },
    loadMoreKeysFailure: (state, { payload }) => {
      state.list = {
        ...state.list,
        loading: false,
        error: payload,
      }
    },

    // load list of indexes
    loadList: (state) => {
      state.list = {
        ...state.list,
        loading: true,
        error: '',
      }
    },
    loadListSuccess: (state, { payload }: PayloadAction<RedisResponseBuffer[]>) => {
      state.list = {
        ...state.list,
        loading: false,
        data: payload,
      }
    },
    loadListFailure: (state, { payload }) => {
      state.list = {
        ...state.list,
        loading: false,
        error: payload,
      }
    },

    // create an index
    createIndex: (state) => {
      state.createIndex = {
        ...state.createIndex,
        loading: true,
        error: '',
      }
    },
    createIndexSuccess: (state) => {
      state.createIndex = {
        ...state.createIndex,
        loading: false,
      }
    },
    createIndexFailure: (state, { payload }: PayloadAction<string>) => {
      state.createIndex = {
        ...state.createIndex,
        loading: false,
        error: payload,
      }
    },
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
  loadList,
  loadListSuccess,
  loadListFailure,
  createIndex,
  createIndexSuccess,
  createIndexFailure,
  setRedisearchInitialState,
} = redisearchSlice.actions

// Selectors
export const redisearchSelector = (state: RootState) => state.browser.redisearch
export const redisearchDataSelector = (state: RootState) => state.browser.redisearch.data
export const redisearchListSelector = (state: RootState) => state.browser.redisearch.list
export const createIndexStateSelector = (state: RootState) => state.browser.redisearch.createIndex

// The reducer
export default redisearchSlice.reducer

// Asynchronous thunk action
export function fetchRedisearchKeysAction(
  cursor: string,
  count: number,
  onSuccess?: (value: GetKeysWithDetailsResponse) => void,
  onFailed?: () => void,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(loadKeys())

    try {
      const state = stateInit()
      const { encoding } = state.app.info
      const { search: query } = state.browser.keys
      const { data, status } = await apiService.post<GetKeysWithDetailsResponse>(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          ApiEndpoints.REDISEARCH_SEARCH
        ),
        {
          limit: count, offset: cursor, query: query || DEFAULT_SEARCH_MATCH, keysInfo: false,
        },
        {
          params: { encoding },
        }
      )

      if (isStatusSuccessful(status)) {
        dispatch(loadKeysSuccess(data))
        onSuccess?.(data)
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(loadKeysFailure(errorMessage))
      onFailed?.()
    }
  }
}

// export function fetchMoreRedisearchKeysAction(
//   onSuccess?: (value: RedisResponseBuffer[]) => void,
//   onFailed?: () => void,
// ) {
//   return async (dispatch: AppDispatch, stateInit: () => RootState) => {
//     dispatch(loadMoreKeys())

//     try {
//       const state = stateInit()
//       const { encoding } = state.app.info
//       const { data, status } = await apiService.get<GetKeysWithDetailsResponse>(
//         getUrl(
//           state.connections.instances.connectedInstance?.id,
//           ApiEndpoints.REDISEARCH_SEARCH
//         ),
//         {
//           params: { encoding },
//         }
//       )

//       if (isStatusSuccessful(status)) {
//         dispatch(loadMoreKeysSuccess(data))
//         onSuccess?.(data)
//       }
//     } catch (_err) {
//       const error = _err as AxiosError
//       const errorMessage = getApiErrorMessage(error)
//       dispatch(addErrorNotification(error))
//       dispatch(loadMoreKeysFailure(errorMessage))
//       onFailed?.()
//     }
//   }
// }

export function fetchRedisearchListAction(
  onSuccess?: (value: RedisResponseBuffer[]) => void,
  onFailed?: () => void,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(loadList())

    try {
      const state = stateInit()
      const { encoding } = state.app.info
      const { data, status } = await apiService.get<RedisResponseBuffer[]>(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          ApiEndpoints.REDISEARCH
        ),
        {
          params: { encoding },
        }
      )

      if (isStatusSuccessful(status)) {
        dispatch(loadListSuccess(data))
        onSuccess?.(data)
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(loadListFailure(errorMessage))
      onFailed?.()
    }
  }
}
export function createRedisearchIndexAction(
  data: CreateRedisearchIndexDto,
  onSuccess?: () => void,
  onFailed?: () => void,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(createIndex())

    try {
      const state = stateInit()
      const { encoding } = state.app.info
      const { status } = await apiService.post<void>(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          ApiEndpoints.REDISEARCH
        ),
        {
          ...data
        },
        {
          params: { encoding },
        }
      )

      if (isStatusSuccessful(status)) {
        dispatch(createIndexSuccess())
        dispatch(addMessageNotification(successMessages.CREATE_INDEX()))
        dispatch(fetchRedisearchListAction())
        onSuccess?.()
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(createIndexFailure(errorMessage))
      onFailed?.()
    }
  }
}
