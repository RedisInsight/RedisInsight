import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { BulkActionsType, MAX_BULK_ACTION_ERRORS_LENGTH } from 'uiSrc/constants'
import { IBulkActionOverview } from 'apiSrc/modules/bulk-actions/interfaces/bulk-action-overview.interface'

import { RootState } from '../store'
import { StateBulkActions } from '../interfaces'

export const initialState: StateBulkActions = {
  isShowBulkActions: false,
  loading: false,
  error: '',
  isConnected: false,
  isActionTriggered: false,
  selectedBulkAction: {
    id: '',
    type: BulkActionsType.Delete,
    overview: null,
  },
}

// A slice for recipes
const bulkActionsSlice = createSlice({
  name: 'bulkActions',
  initialState,
  reducers: {
    setBulkActionsInitialState: () => initialState,

    toggleBulkActions: (state) => {
      state.isShowBulkActions = !state.isShowBulkActions
    },

    setBulkActionConnected: (state, { payload }: PayloadAction<boolean>) => {
      state.isConnected = payload
    },

    setLoading: (state, { payload }: PayloadAction<boolean>) => {
      state.loading = payload
    },

    setBulkActionType: (state, { payload }: PayloadAction<BulkActionsType>) => {
      state.selectedBulkAction.type = payload
    },

    toggleBulkActionTriggered: (state) => {
      state.isActionTriggered = !state.isActionTriggered
    },

    setOverview: (state, { payload }: PayloadAction<IBulkActionOverview>) => {
      let errors = state.selectedBulkAction.overview?.summary?.errors || []

      errors = payload.summary?.errors?.concat(errors).slice(0, MAX_BULK_ACTION_ERRORS_LENGTH)
      state.selectedBulkAction.overview = {
        ...payload,
        summary: {
          ...payload.summary,
          errors,
        }
      }
    },

    disconnectBulkAction: (state) => {
      state.loading = false
      state.isActionTriggered = false
      state.isConnected = false
    },

    // bulk delete
    bulkDeleteSuccess: (state) => {
      state.loading = false
    }
  },
})

// Actions generated from the slice
export const {
  setLoading,
  setBulkActionType,
  setBulkActionConnected,
  disconnectBulkAction,
  toggleBulkActionTriggered,
  setOverview,
  setBulkActionsInitialState,
} = bulkActionsSlice.actions

// Selectors
export const bulkActionsSelector = (state: RootState) => state.browser.bulkActions
export const selectedBulkActionsSelector = (state: RootState) => state.browser.bulkActions?.selectedBulkAction
export const overviewBulkActionsSelector = (state: RootState) => state.browser.bulkActions?.selectedBulkAction.overview
export const summaryBulkActionsSelector = (state: RootState) =>
  state.browser.bulkActions?.selectedBulkAction.overview?.summary

// The reducer
export default bulkActionsSlice.reducer
