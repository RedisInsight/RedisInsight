import { createSlice } from '@reduxjs/toolkit'
import { ApiEndpoints, MONACO_MANUAL } from 'uiSrc/constants'
import { getApiErrorMessage, isStatusSuccessful, } from 'uiSrc/utils'
import { resourcesService } from 'uiSrc/services'
import { EnablementAreaComponent, IEnablementAreaItem, StateWorkbenchEnablementArea } from 'uiSrc/slices/interfaces'

import { AppDispatch, RootState } from '../store'

export const defaultItems: Record<string, IEnablementAreaItem> = {
  manual: {
    type: EnablementAreaComponent.CodeButton,
    id: 'manual',
    label: 'Manual',
    args: {
      content: MONACO_MANUAL,
    }
  }
}
export const initialState: StateWorkbenchEnablementArea = {
  loading: false,
  error: '',
  items: {},
}

// A slice for recipes
const workbenchEnablementAreaSlice = createSlice({
  name: 'workbenchEnablementArea',
  initialState,
  reducers: {
    getWBEnablementArea: (state) => {
      state.loading = true
    },
    getWBEnablementAreaSuccess: (state, { payload }) => {
      state.loading = false
      state.items = payload
    },
    getWBEnablementAreaFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
      state.items = defaultItems
    },
  }
})

// A selector
export const workbenchEnablementAreaSelector = (state: RootState) => state.workbench.enablementArea

// Actions generated from the slice
export const {
  getWBEnablementArea,
  getWBEnablementAreaSuccess,
  getWBEnablementAreaFailure,
} = workbenchEnablementAreaSlice.actions

// The reducer
export default workbenchEnablementAreaSlice.reducer

// Asynchronous thunk action
export function fetchEnablementArea(onSuccessAction?: () => void, onFailAction?: () => void) {
  return async (dispatch: AppDispatch) => {
    dispatch(getWBEnablementArea())

    try {
      const { data, status } = await resourcesService
        .get<Record<string, IEnablementAreaItem>>(ApiEndpoints.ENABLEMENT_AREA)

      if (isStatusSuccessful(status)) {
        dispatch(getWBEnablementAreaSuccess(data))
        onSuccessAction?.()
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(getWBEnablementAreaFailure(errorMessage))
      onFailAction?.()
    }
  }
}
