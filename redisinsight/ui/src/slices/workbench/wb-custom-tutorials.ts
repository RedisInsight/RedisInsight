import { createSlice } from '@reduxjs/toolkit'
import { ApiEndpoints } from 'uiSrc/constants'
import { getApiErrorMessage, isStatusSuccessful, } from 'uiSrc/utils'
import { apiService } from 'uiSrc/services'
import { IEnablementAreaItem, StateWorkbenchEnablementArea } from 'uiSrc/slices/interfaces'

import { addErrorNotification } from 'uiSrc/slices/app/notifications'
import { AppDispatch, RootState } from '../store'

export const defaultItems: Record<string, IEnablementAreaItem> = {

}
export const initialState: StateWorkbenchEnablementArea = {
  loading: false,
  error: '',
  items: {},
}

// A slice for recipes
const workbenchCustomTutorialsSlice = createSlice({
  name: 'workbenchCustomTutorials',
  initialState,
  reducers: {
    getWBCustomTutorials: (state) => {
      state.loading = true
    },
    getWBCustomTutorialsSuccess: (state, { payload }) => {
      state.loading = false
      state.items = payload
    },
    getWBCustomTutorialsFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
      state.items = defaultItems
    },
  }
})

// A selector
export const workbenchCustomTutorialsSelector = (state: RootState) => state.workbench.customTutorials

// Actions generated from the slice
export const {
  getWBCustomTutorials,
  getWBCustomTutorialsSuccess,
  getWBCustomTutorialsFailure,
} = workbenchCustomTutorialsSlice.actions

// The reducer
export default workbenchCustomTutorialsSlice.reducer

// Asynchronous thunk action
export function fetchCustomTutorials(onSuccessAction?: () => void, onFailAction?: () => void) {
  return async (dispatch: AppDispatch) => {
    dispatch(getWBCustomTutorials())

    try {
      const { data, status } = await apiService
        .get<Record<string, IEnablementAreaItem>>(ApiEndpoints.CUSTOM_TUTORIALS_MANIFEST)
      if (isStatusSuccessful(status)) {
        dispatch(getWBCustomTutorialsSuccess(data))
        onSuccessAction?.()
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(getWBCustomTutorialsFailure(errorMessage))
      onFailAction?.()
    }
  }
}

export function uploadCustomTutorial(formData: any, onSuccessAction?: () => void, onFailAction?: () => void) {
  return async (dispatch: AppDispatch) => {
    try {
      const { status } = await apiService.post(
        ApiEndpoints.CUSTOM_TUTORIALS,
        formData,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'multipart/form-data'
          }
        }
      )
      if (isStatusSuccessful(status)) {
        dispatch(fetchCustomTutorials())
        onSuccessAction?.()
      }
    } catch (error) {
      dispatch(addErrorNotification(error))
      onFailAction?.()
    }
  }
}

export function deleteCustomTutorial(id: any, onSuccessAction?: () => void, onFailAction?: () => void) {
  return async (dispatch: AppDispatch) => {
    try {
      const { status } = await apiService.delete(`${ApiEndpoints.CUSTOM_TUTORIALS}/${id}`)
      if (isStatusSuccessful(status)) {
        dispatch(fetchCustomTutorials())
        onSuccessAction?.()
      }
    } catch (error) {
      dispatch(addErrorNotification(error))
      onFailAction?.()
    }
  }
}
