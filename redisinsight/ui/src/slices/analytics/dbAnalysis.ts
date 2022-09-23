import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AxiosError } from 'axios'
import { isNull } from 'lodash'
import { ApiEndpoints, } from 'uiSrc/constants'
import { apiService, } from 'uiSrc/services'
import { addErrorNotification } from 'uiSrc/slices/app/notifications'
import { StateDatabaseAnalysis } from 'uiSrc/slices/interfaces/analytics'
import { getApiErrorMessage, getUrl, isStatusSuccessful } from 'uiSrc/utils'
import { DatabaseAnalysis, ShortDatabaseAnalysis } from 'apiSrc/modules/database-analysis/models'

import { AppDispatch, RootState } from '../store'

export const initialState: StateDatabaseAnalysis = {
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

const databaseAnalysisSlice = createSlice({
  name: 'databaseAnalysis',
  initialState,
  reducers: {
    setDatabaseAnalysisInitialState: () => initialState,
    getDBAnalysis: (state) => {
      state.loading = true
    },
    getDBAnalysisSuccess: (state, { payload }: PayloadAction<DatabaseAnalysis>) => {
      state.loading = false
      state.data = payload
    },
    getDBAnalysisError: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
    loadDBAnalysisReports: (state) => {
      state.history.loading = true
    },
    loadDBAnalysisReportsSuccess: (state, { payload }: PayloadAction<ShortDatabaseAnalysis[]>) => {
      state.history.loading = false
      state.history.data = payload
    },
    loadDBAnalysisReportsError: (state, { payload }) => {
      state.history.loading = false
      state.history.error = payload
    },
    setSelectedAnalysisId: (state, { payload }: PayloadAction<string>) => {
      state.history.selectedAnalysis = payload
    },
    addNewAnalysisReport: (state, { payload }: PayloadAction<ShortDatabaseAnalysis>) => {
      if (isNull(state.history.data)) {
        state.history.data = [payload]
      } else {
        state.history.data = [
          payload,
          ...state.history.data,
        ]
      }
    },
  }
})

export const DBAnalysis = (state: RootState) => state.analytics.databaseAnalysis
export const DBAnalysisReportsSelector = (state: RootState) => state.analytics.databaseAnalysis.history

export const {
  addNewAnalysisReport,
  setDatabaseAnalysisInitialState,
  getDBAnalysis,
  getDBAnalysisSuccess,
  getDBAnalysisError,
  loadDBAnalysisReports,
  loadDBAnalysisReportsSuccess,
  loadDBAnalysisReportsError,
  setSelectedAnalysisId,
} = databaseAnalysisSlice.actions

// The reducer
export default databaseAnalysisSlice.reducer

// Asynchronous thunk action
export function fetchDBAnalysisAction(
  instanceId: string,
  id: string,
  onSuccessAction?: (data: DatabaseAnalysis) => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(getDBAnalysis())

      const { data, status } = await apiService.get<DatabaseAnalysis>(
        getUrl(
          instanceId,
          ApiEndpoints.DATABASE_ANALYSIS,
          id
        )
      )

      if (isStatusSuccessful(status)) {
        dispatch(getDBAnalysisSuccess(data))

        onSuccessAction?.(data)
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(getDBAnalysisError(errorMessage))
      onFailAction?.()
    }
  }
}

export function createNewAnalysis(
  instanceId: string,
  delimiter: string,
  onSuccessAction?: (data: DatabaseAnalysis) => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(getDBAnalysis())

      const { data, status } = await apiService.post<DatabaseAnalysis>(
        getUrl(
          instanceId,
          ApiEndpoints.DATABASE_ANALYSIS,
        ),
        {
          delimiter,
        }
      )

      if (isStatusSuccessful(status)) {
        dispatch(getDBAnalysisSuccess(data))
        dispatch(addNewAnalysisReport({ id: data.id, createdAt: data.createdAt }))
        dispatch(setSelectedAnalysisId(data.id))
        onSuccessAction?.(data)
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(getDBAnalysisError(errorMessage))
      onFailAction?.()
    }
  }
}

export function fetchDBAnalysisReportsHistory(
  instanceId: string,
  onSuccessAction?: (data: ShortDatabaseAnalysis[]) => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(loadDBAnalysisReports())

      const { data, status } = await apiService.get<ShortDatabaseAnalysis[]>(
        getUrl(
          instanceId,
          ApiEndpoints.DATABASE_ANALYSIS
        )
      )

      if (isStatusSuccessful(status)) {
        dispatch(loadDBAnalysisReportsSuccess(data))

        onSuccessAction?.(data)
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(loadDBAnalysisReportsError(errorMessage))
      onFailAction?.()
    }
  }
}
