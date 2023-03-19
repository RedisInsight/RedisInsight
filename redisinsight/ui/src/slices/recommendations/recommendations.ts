import { createSlice } from '@reduxjs/toolkit'
import { AxiosError } from 'axios'

import { apiService } from 'uiSrc/services'
import { ApiEndpoints } from 'uiSrc/constants'
import { addErrorNotification } from 'uiSrc/slices/app/notifications'
import { getApiErrorMessage, getUrl, isStatusSuccessful } from 'uiSrc/utils'
import { StateRecommendations } from '../interfaces/recommendations'

import { AppDispatch, RootState } from '../store'

export const initialState: StateRecommendations = {
  data: {
    recommendations: [],
    totalUnread: 0,
  },
  loading: false,
  error: '',
  isContentVisible: false,
}

// A slice for recipes
const recommendationsSlice = createSlice({
  name: 'recommendations',
  initialState,
  reducers: {
    getRecommendations: (state) => {
      state.loading = true
      state.error = ''
    },
    getRecommendationsSuccess: (state, { payload }: { payload: any }) => {
      state.loading = false
      state.data = payload
      state.error = ''
    },
    getRecommendationsFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
    setIsContentVisible: (state, { payload }) => {
      state.isContentVisible = payload
    },
    readRecommendations: (state, { payload }) => {
      state.data = {
        ...state.data,
        totalUnread: payload
      }
    },
  },
})

// Actions generated from the slice
export const {
  getRecommendations,
  getRecommendationsSuccess,
  getRecommendationsFailure,
  setHighlighting,
  setIsContentVisible,
  readRecommendations,
} = recommendationsSlice.actions

// A selector
export const recommendationsSelector = (state: RootState) => state.recommendations

// The reducer
export default recommendationsSlice.reducer

// Asynchronous thunk action
export function fetchRecommendationsAction(
  instanceId: string,
  onSuccessAction?: () => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    const state = stateInit()
    const { isContentVisible } = state?.recommendations

    try {
      dispatch(getRecommendations())

      const { data, status } = await apiService.get<any>(
        getUrl(
          instanceId,
          ApiEndpoints.RECOMMENDATIONS,
        )
      )

      if (isStatusSuccessful(status)) {
        dispatch(getRecommendationsSuccess(data))
        onSuccessAction?.()
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(getRecommendationsFailure(errorMessage))
      onFailAction?.()
    }
  }
}

export function readRecommendationsAction(instanceId: string) {
  return async (dispatch: AppDispatch) => {
    try {
      const { data, status } = await apiService.patch(
        getUrl(
          instanceId,
          ApiEndpoints.RECOMMENDATIONS_READ,
        )
      )

      if (isStatusSuccessful(status)) {
        dispatch(readRecommendations(data.totalUnread))
      }
    } catch (error) {
      //
    }
  }
}
