import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AxiosError } from 'axios'
import { ApiEndpoints, } from 'uiSrc/constants'
import { apiService, } from 'uiSrc/services'
import { addErrorNotification } from 'uiSrc/slices/app/notifications'
import { StateMemoryEfficiency } from 'uiSrc/slices/interfaces/analytics'
import { getApiErrorMessage, getUrl, isStatusSuccessful } from 'uiSrc/utils'

// import { MemoryEfficiency } from 'apiSrc/modules/cluster-monitor/models/cluster-details'
import { AppDispatch, RootState } from '../store'

export const initialState: StateMemoryEfficiency = {
  loading: false,
  error: '',
  data: null,
  history: {
    loading: false,
    error: '',
    data: [],
    selectedAnalysis: null,
  }
}

const memoryEfficiencySlice = createSlice({
  name: 'memoryEfficiency',
  initialState,
  reducers: {
    setMemoryEfficiencyInitialState: () => initialState,
    getMemoryEfficiency: (state) => {
      state.loading = true
    },
    // getMemoryEfficiencySuccess: (state, { payload }: PayloadAction<MemoryEfficiency>) => {
    getMemoryEfficiencySuccess: (state, { payload }: PayloadAction<any>) => {
      state.loading = false
      state.data = payload
    },
    getMemoryEfficiencyError: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
    loadMemoryEfficiencyHistory: (state) => {
      state.history.loading = true
    },
    loadMemoryEfficiencyHistorySuccess: (state, { payload }: PayloadAction<any>) => {
      state.history.loading = false
      state.history.data = payload
    },
    loadMemoryEfficiencyHistoryError: (state, { payload }) => {
      state.history.loading = false
      state.history.error = payload
    },
    setSelectedAnalysis: (state, { payload }) => {
      state.history.selectedAnalysis = payload
    },
    addNewAnalysis: (state, { payload }: PayloadAction<any>) => {
      state.history.data = [
        payload,
        ...state.history.data,
      ]
    },
  }
})

export const memoryEfficiencySelector = (state: RootState) => state.analytics.memoryEfficiency
export const memoryEfficiencyHistorySelector = (state: RootState) => state.analytics.memoryEfficiency.history

export const {
  addNewAnalysis,
  setMemoryEfficiencyInitialState,
  getMemoryEfficiency,
  getMemoryEfficiencySuccess,
  getMemoryEfficiencyError,
  loadMemoryEfficiencyHistory,
  loadMemoryEfficiencyHistorySuccess,
  loadMemoryEfficiencyHistoryError,
  setSelectedAnalysis,
} = memoryEfficiencySlice.actions

// The reducer
export default memoryEfficiencySlice.reducer

// Asynchronous thunk action
export function fetchMemoryEfficiencyAction(
  instanceId: string,
  id: string,
  // onSuccessAction?: (data: MemoryEfficiency) => void,
  onSuccessAction?: (data: any) => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(getMemoryEfficiency())

      // const { data, status } = await apiService.post<MemoryEfficiency>(
      const { data, status } = await apiService.get<any>(
        getUrl(
          instanceId,
          ApiEndpoints.MEMORY_EFFICIENCY,
          id
        )
      )

      if (isStatusSuccessful(status)) {
        dispatch(getMemoryEfficiencySuccess(data))

        onSuccessAction?.(data)
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(getMemoryEfficiencyError(errorMessage))
      onFailAction?.()
    }
  }
}

export function createNewAnalysis(
  instanceId: string,
  delimiter: string,
  // onSuccessAction?: (data: MemoryEfficiency) => void,
  onSuccessAction?: (data: any) => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(getMemoryEfficiency())

      // const { data, status } = await apiService.post<MemoryEfficiency>(
      const { data, status } = await apiService.post<any>(
        getUrl(
          instanceId,
          ApiEndpoints.MEMORY_EFFICIENCY,
        ),
        {
          delimiter,
        }
      )

      if (isStatusSuccessful(status)) {
        dispatch(getMemoryEfficiencySuccess(data))
        dispatch(addNewAnalysis({ id: data.id, createdAt: data.createdAt }))
        dispatch(setSelectedAnalysis(data.id))
        onSuccessAction?.(data)
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(getMemoryEfficiencyError(errorMessage))
      onFailAction?.()
    }
  }
}

export function fetchMemoryEfficiencyHistory(
  instanceId: string,
  // onSuccessAction?: (data: MemoryEfficiency) => void,
  onSuccessAction?: (data: any) => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(loadMemoryEfficiencyHistory())

      // const { data, status } = await apiService.post<MemoryEfficiency>(
      const { data, status } = await apiService.get<any>(
        getUrl(
          instanceId,
          ApiEndpoints.MEMORY_EFFICIENCY
        )
      )

      if (isStatusSuccessful(status)) {
        dispatch(loadMemoryEfficiencyHistorySuccess(data))

        onSuccessAction?.(data)
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(loadMemoryEfficiencyHistoryError(errorMessage))
      onFailAction?.()
    }
  }
}
