import { createSlice, PayloadAction, SliceCaseReducers } from '@reduxjs/toolkit'

import { BulkActionsType } from 'uiSrc/constants'

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
const bulkActionsSlice = createSlice<StateBulkActions, SliceCaseReducers<StateBulkActions>>({
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

    // common bulk process
    processBulkAction: (state) => {
      state.loading = true
    },
    processBulkActionFailure: (state, { payload }: PayloadAction<string>) => {
      state.loading = false
      state.error = payload
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
} = bulkActionsSlice.actions

// Selectors
export const bulkActionsSelector = (state: RootState) => state.browser.bulkActions
export const selectedBulkActionsSelector = (state: RootState) => state.browser.bulkActions?.selectedBulkAction

// The reducer
export default bulkActionsSlice.reducer
