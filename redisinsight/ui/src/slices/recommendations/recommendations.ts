import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { AxiosError } from 'axios'

import { apiService, localStorageService } from 'uiSrc/services'
import { ApiEndpoints, BrowserStorageItem } from 'uiSrc/constants'
import { addErrorNotification } from 'uiSrc/slices/app/notifications'
import { getApiErrorMessage, getUrl, isStatusSuccessful } from 'uiSrc/utils'
import { Vote } from 'uiSrc/constants/recommendations'

import { AppDispatch, RootState } from '../store'
import { StateRecommendations, IRecommendations, IRecommendation } from '../interfaces/recommendations'

export const initialState: StateRecommendations = {
  data: {
    recommendations: [],
    totalUnread: 0,
  },
  loading: false,
  error: '',
  isContentVisible: false,
  isHighlighted: !localStorageService?.get(BrowserStorageItem.recommendationsViewed)
}

// A slice for recipes
const recommendationsSlice = createSlice({
  name: 'recommendations',
  initialState,
  reducers: {
    resetRecommendationsHighlighting: (state) => {
      state.isHighlighted = !localStorageService?.get(BrowserStorageItem.recommendationsViewed)
    },
    getRecommendations: (state) => {
      state.loading = true
      state.error = ''
    },
    getRecommendationsSuccess: (state, { payload }: { payload: IRecommendations }) => {
      state.loading = false
      state.data = payload
      state.error = ''
    },
    getRecommendationsFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
    setIsContentVisible: (state, { payload }) => {
      if (!localStorageService?.get(BrowserStorageItem.recommendationsViewed)) {
        localStorageService?.set(BrowserStorageItem.recommendationsViewed, true)
        state.isHighlighted = false
      }
      state.isContentVisible = payload
    },
    setIsHighlighted: (state, { payload }) => {
      state.isHighlighted = payload
    },
    setTotalUnread: (state, { payload }) => {
      state.data.totalUnread = payload
      state.isHighlighted = !!payload
    },
    readRecommendations: (state, { payload }) => {
      state.data = {
        ...state.data,
        totalUnread: payload
      }
    },
    setRecommendationVote: () => {
      // we don't have any loading here
    },
    setRecommendationVoteSuccess: (state, { payload }: PayloadAction<IRecommendation>) => {
      state.data.recommendations = [
        ...state.data.recommendations.map((recommendation) =>
          (payload.id === recommendation.id ? payload : recommendation))
      ]
    },
    setRecommendationVoteError: (state, { payload }) => {
      state.error = payload
    },
  },
})

// Actions generated from the slice
export const {
  resetRecommendationsHighlighting,
  getRecommendations,
  getRecommendationsSuccess,
  getRecommendationsFailure,
  setIsContentVisible,
  setIsHighlighted,
  readRecommendations,
  setRecommendationVote,
  setRecommendationVoteSuccess,
  setRecommendationVoteError,
  setTotalUnread,
} = recommendationsSlice.actions

// A selector
export const recommendationsSelector = (state: RootState) => state.recommendations

// The reducer
export default recommendationsSlice.reducer

// Asynchronous thunk action
export function fetchRecommendationsAction(
  instanceId: string,
  onSuccessAction?: (recommendations: IRecommendation[]) => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(getRecommendations())

      const { data, status } = await apiService.get<IRecommendations>(
        getUrl(
          instanceId,
          ApiEndpoints.RECOMMENDATIONS,
        )
      )

      if (isStatusSuccessful(status)) {
        if (data.totalUnread) {
          dispatch(setIsHighlighted(true))
        }
        dispatch(getRecommendationsSuccess(data))
        onSuccessAction?.(data.recommendations)
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
        dispatch(setIsHighlighted(false))
      }
    } catch (error) {
      // ignore
    }
  }
}

// Asynchronous thunk action
export function putLiveRecommendationVote(
  id: string,
  vote: Vote,
  name: string,
  onSuccessAction?: (instanceId: string, name: string, vote: Vote) => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    try {
      dispatch(setRecommendationVote())
      const state = stateInit()
      const instanceId = state.connections.instances.connectedInstance?.id

      const { data, status } = await apiService.patch<IRecommendation>(
        getUrl(
          instanceId,
          ApiEndpoints.RECOMMENDATIONS,
          id,
        ),
        { vote },
      )

      if (isStatusSuccessful(status)) {
        dispatch(setRecommendationVoteSuccess(data))

        onSuccessAction?.(instanceId, name, vote)
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(setRecommendationVoteError(errorMessage))
      onFailAction?.()
    }
  }
}
