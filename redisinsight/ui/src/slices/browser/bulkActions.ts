import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { AxiosError } from 'axios'
import { ApiEndpoints, BulkActionsType, MAX_BULK_ACTION_ERRORS_LENGTH } from 'uiSrc/constants'
import { apiService } from 'uiSrc/services'
import { getApiErrorMessage, getUrl, isStatusSuccessful } from 'uiSrc/utils'

import { addErrorNotification } from 'uiSrc/slices/app/notifications'
import { AppDispatch, RootState } from '../store'
import { StateBulkActions, IBulkActionOverview } from '../interfaces'

export const initialState: StateBulkActions = {
  isShowBulkActions: false,
  loading: false,
  error: '',
  isConnected: false,
  bulkDelete: {
    isActionTriggered: false,
    loading: false,
    error: '',
    overview: null,
  },
  bulkUpload: {
    loading: false,
    error: '',
    overview: null,
    fileName: ''
  },
  selectedBulkAction: {
    id: '',
    type: null,
  },
}

// A slice for recipes
const bulkActionsSlice = createSlice({
  name: 'bulkActions',
  initialState,
  reducers: {
    setBulkActionsInitialState: (state) => {
      state.bulkUpload?.abortController?.abort()

      return initialState
    },

    setBulkDeleteStartAgain: (state) => {
      state.bulkDelete = initialState.bulkDelete
      state.isConnected = false
    },

    setBulkUploadStartAgain: (state) => {
      state.bulkUpload = initialState.bulkUpload
      state.isConnected = false
    },

    toggleBulkActions: (state) => {
      state.isShowBulkActions = !state.isShowBulkActions
    },

    setBulkActionConnected: (state, { payload }: PayloadAction<boolean>) => {
      state.isConnected = payload
    },

    setLoading: (state, { payload }: PayloadAction<boolean>) => {
      state.loading = payload
    },

    setBulkDeleteLoading: (state, { payload }: PayloadAction<boolean>) => {
      state.bulkDelete.loading = payload
    },

    setBulkActionType: (state, { payload }: PayloadAction<BulkActionsType>) => {
      state.selectedBulkAction.type = payload
    },

    toggleBulkDeleteActionTriggered: (state) => {
      state.bulkDelete.isActionTriggered = !state.bulkDelete.isActionTriggered
    },

    setDeleteOverview: (state, { payload }: PayloadAction<IBulkActionOverview>) => {
      let errors = state.bulkDelete.overview?.summary?.errors || []

      errors = payload.summary?.errors?.concat(errors).slice(0, MAX_BULK_ACTION_ERRORS_LENGTH)
      state.bulkDelete.overview = {
        ...payload,
        summary: {
          ...payload.summary,
          errors,
        }
      }
    },

    setDeleteOverviewStatus: (state, { payload }) => {
      if (state.bulkDelete.overview) {
        state.bulkDelete.overview.status = payload
      }
    },

    disconnectBulkDeleteAction: (state) => {
      state.bulkDelete.loading = false
      state.bulkDelete.isActionTriggered = false
      state.isConnected = false
    },

    // bulk delete
    bulkDeleteSuccess: (state) => {
      state.bulkDelete.loading = false
    },

    bulkUpload: (state, { payload }: PayloadAction<{ abortController: AbortController }>) => {
      state.bulkUpload.loading = true
      state.bulkUpload.error = ''
      state.bulkUpload.abortController = payload.abortController
    },

    bulkUploadSuccess: (state, { payload }: PayloadAction<{ data: IBulkActionOverview, fileName?: string }>) => {
      state.bulkUpload.loading = false
      state.bulkUpload.overview = payload.data
      state.bulkUpload.fileName = payload.fileName
    },

    bulkUploadFailed: (state, { payload }) => {
      state.bulkUpload.loading = false
      state.bulkUpload.error = payload
    },
  },
})

// Actions generated from the slice
export const {
  setLoading,
  setBulkDeleteLoading,
  setBulkDeleteStartAgain,
  setBulkUploadStartAgain,
  setBulkActionType,
  setBulkActionConnected,
  toggleBulkActions,
  disconnectBulkDeleteAction,
  toggleBulkDeleteActionTriggered,
  setDeleteOverview,
  setDeleteOverviewStatus,
  setBulkActionsInitialState,
  bulkDeleteSuccess,
  bulkUpload,
  bulkUploadFailed,
  bulkUploadSuccess,
} = bulkActionsSlice.actions

// Selectors
export const bulkActionsSelector = (state: RootState) => state.browser.bulkActions
export const selectedBulkActionsSelector = (state: RootState) => state.browser.bulkActions?.selectedBulkAction
export const bulkActionsDeleteSelector = (state: RootState) => state.browser.bulkActions.bulkDelete
export const bulkActionsDeleteOverviewSelector = (state: RootState) => state.browser.bulkActions.bulkDelete.overview
export const bulkActionsDeleteSummarySelector = (state: RootState) =>
  state.browser.bulkActions.bulkDelete.overview?.summary

export const bulkActionsUploadSelector = (state: RootState) => state.browser.bulkActions.bulkUpload
export const bulkActionsUploadOverviewSelector = (state: RootState) => state.browser.bulkActions.bulkUpload.overview
export const bulkActionsUploadSummarySelector = (state: RootState) =>
  state.browser.bulkActions.bulkUpload.overview?.summary

// The reducer
export default bulkActionsSlice.reducer

// Thunk actions
// Asynchronous thunk action
export function bulkUploadDataAction(
  id: string,
  uploadFile: { file: FormData, fileName: string },
  onSuccessAction?: () => void,
  onFailAction?: () => void
) {
  return async (dispatch: AppDispatch) => {
    const abortController = new AbortController()

    dispatch(bulkUpload({ abortController }))

    try {
      const { status, data } = await apiService.post(
        getUrl(
          id,
          ApiEndpoints.BULK_ACTIONS_IMPORT
        ),
        uploadFile.file,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'multipart/form-data'
          },
          signal: abortController.signal
        }
      )

      if (isStatusSuccessful(status)) {
        dispatch(bulkUploadSuccess({ data, fileName: uploadFile.fileName }))
        onSuccessAction?.()
      }
    } catch (error) {
      // show error when request wasn't aborted only
      if (!abortController.signal.aborted) {
        const errorMessage = getApiErrorMessage(error as AxiosError)
        dispatch(addErrorNotification(error as AxiosError))
        dispatch(bulkUploadFailed(errorMessage))
        onFailAction?.()
      }
    }
  }
}
