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
    getDBAnalysisReport: (state) => {
      state.loading = true
    },
    getDBAnalysisReportSuccess: (state, { payload }: PayloadAction<DatabaseAnalysis>) => {
      state.loading = false
      state.data = payload
    },
    getDBAnalysisReportError: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
    loadDBAnalysisReport: (state) => {
      state.history.loading = true
    },
    loadDBAnalysisReportSuccess: (state, { payload }: PayloadAction<ShortDatabaseAnalysis[]>) => {
      state.history.loading = false
      state.history.data = payload
    },
    loadDBAnalysisReportError: (state, { payload }) => {
      state.history.loading = false
      state.history.error = payload
    },
    setSelectedAnalysis: (state, { payload }) => {
      state.history.selectedAnalysis = payload
    },
    addNewAnalysis: (state, { payload }: PayloadAction<ShortDatabaseAnalysis>) => {
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
  addNewAnalysis,
  setDatabaseAnalysisInitialState,
  getDBAnalysisReport,
  getDBAnalysisReportSuccess,
  getDBAnalysisReportError,
  loadDBAnalysisReport,
  loadDBAnalysisReportSuccess,
  loadDBAnalysisReportError,
  setSelectedAnalysis,
} = databaseAnalysisSlice.actions

// The reducer
export default databaseAnalysisSlice.reducer

// Asynchronous thunk action
export function fetchDBAnalysisReportAction(
  instanceId: string,
  id: string,
  onSuccessAction?: (data: DatabaseAnalysis) => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(getDBAnalysisReport())

      const { data, status } = await apiService.get<DatabaseAnalysis>(
        getUrl(
          instanceId,
          ApiEndpoints.DATABASE_ANALYSIS,
          id
        )
      )

      if (isStatusSuccessful(status)) {
        dispatch(getDBAnalysisReportSuccess(data))

        onSuccessAction?.(data)
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(getDBAnalysisReportError(errorMessage))
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
      dispatch(getDBAnalysisReport())

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
        dispatch(getDBAnalysisReportSuccess(data))
        dispatch(addNewAnalysis({ id: data.id, createdAt: data.createdAt }))
        dispatch(setSelectedAnalysis(data.id))
        onSuccessAction?.(data)
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(getDBAnalysisReportError(errorMessage))
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
      dispatch(loadDBAnalysisReport())

      const { data, status } = await apiService.get<ShortDatabaseAnalysis[]>(
        getUrl(
          instanceId,
          ApiEndpoints.DATABASE_ANALYSIS
        )
      )

      if (isStatusSuccessful(status)) {
        dispatch(loadDBAnalysisReportSuccess(data))

        onSuccessAction?.(data)
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(loadDBAnalysisReportError(errorMessage))
      onFailAction?.()
    }
  }
}
