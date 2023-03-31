import { createSlice } from '@reduxjs/toolkit'
import { ApiEndpoints } from 'uiSrc/constants'
import { getApiErrorMessage, isStatusSuccessful, } from 'uiSrc/utils'
import { resourcesService } from 'uiSrc/services'
import { IEnablementAreaItem, StateWorkbenchEnablementArea } from 'uiSrc/slices/interfaces'

import { AppDispatch, RootState } from '../store'

export const defaultItems: IEnablementAreaItem[] = []

export const initialState: StateWorkbenchEnablementArea = {
  loading: false,
  error: '',
  items: [],
}

// A slice for recipes
const workbenchGuidesSlice = createSlice({
  name: 'workbenchGuides',
  initialState,
  reducers: {
    getWBGuides: (state) => {
      state.loading = true
    },
    getWBGuidesSuccess: (state, { payload }: { payload: IEnablementAreaItem }) => {
      state.loading = false
      state.items = [payload]
    },
    getWBGuidesFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
      state.items = defaultItems
    },
  }
})

// A selector
export const workbenchGuidesSelector = (state: RootState) => state.workbench.guides

// Actions generated from the slice
export const {
  getWBGuides,
  getWBGuidesSuccess,
  getWBGuidesFailure,
} = workbenchGuidesSlice.actions

// The reducer
export default workbenchGuidesSlice.reducer

// Asynchronous thunk action
export function fetchGuides(onSuccessAction?: () => void, onFailAction?: () => void) {
  return async (dispatch: AppDispatch) => {
    dispatch(getWBGuides())

    try {
      const { data, status } = await resourcesService.get(ApiEndpoints.GUIDES)
      if (isStatusSuccessful(status)) {
        dispatch(getWBGuidesSuccess(data))
        onSuccessAction?.()
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(getWBGuidesFailure(errorMessage))
      onFailAction?.()
    }
  }
}
