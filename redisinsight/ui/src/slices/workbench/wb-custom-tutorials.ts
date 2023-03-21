import { createSlice } from '@reduxjs/toolkit'
import { remove } from 'lodash'
import { ApiEndpoints } from 'uiSrc/constants'
import { getApiErrorMessage, isStatusSuccessful, } from 'uiSrc/utils'
import { apiService } from 'uiSrc/services'
import {
  EnablementAreaComponent,
  IEnablementAreaItem,
  StateWorkbenchEnablementArea,
} from 'uiSrc/slices/interfaces'

import { addErrorNotification } from 'uiSrc/slices/app/notifications'
import { AppDispatch, RootState } from '../store'

export const defaultItems: IEnablementAreaItem[] = [
  {
    id: 'custom-tutorials',
    label: 'MY TUTORIALS',
    type: EnablementAreaComponent.Group,
    children: []
  }
]

export const initialState: StateWorkbenchEnablementArea = {
  loading: false,
  deleting: false,
  error: '',
  items: defaultItems,
}

// A slice for recipes
const workbenchCustomTutorialsSlice = createSlice({
  name: 'workbenchCustomTutorials',
  initialState,
  reducers: {
    getWBCustomTutorials: (state) => {
      state.loading = true
    },
    getWBCustomTutorialsSuccess: (state, { payload }: { payload: IEnablementAreaItem }) => {
      state.loading = false
      state.items = [payload]
    },
    getWBCustomTutorialsFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
      state.items = defaultItems
    },
    uploadWbCustomTutorial: (state) => {
      state.loading = true
    },
    uploadWBCustomTutorialSuccess: (state, { payload }) => {
      state.loading = false
      if (state.items[0]?.children) {
        state.items[0].children.unshift(payload)
      }
    },
    uploadWBCustomTutorialFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
    deleteWbCustomTutorial: (state) => {
      state.deleting = true
    },
    deleteWBCustomTutorialSuccess: (state, { payload }) => {
      state.deleting = false
      if (state.items[0].children) {
        remove(state.items[0].children, (item) => item.id === payload)
      }
    },
    deleteWBCustomTutorialFailure: (state, { payload }) => {
      state.deleting = false
      state.error = payload
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
  uploadWbCustomTutorial,
  uploadWBCustomTutorialSuccess,
  uploadWBCustomTutorialFailure,
  deleteWbCustomTutorial,
  deleteWBCustomTutorialSuccess,
  deleteWBCustomTutorialFailure
} = workbenchCustomTutorialsSlice.actions

// The reducer
export default workbenchCustomTutorialsSlice.reducer

// Asynchronous thunk action
export function fetchCustomTutorials(onSuccessAction?: () => void, onFailAction?: () => void) {
  return async (dispatch: AppDispatch) => {
    dispatch(getWBCustomTutorials())

    try {
      const { data, status } = await apiService.get(ApiEndpoints.CUSTOM_TUTORIALS_MANIFEST)
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

export function uploadCustomTutorial(
  formData: FormData,
  onSuccessAction?: () => void,
  onFailAction?: (error?: string) => void
) {
  return async (dispatch: AppDispatch) => {
    dispatch(uploadWbCustomTutorial())
    try {
      const { status, data } = await apiService.post(
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
        dispatch(uploadWBCustomTutorialSuccess(data))
        onSuccessAction?.()
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(uploadWBCustomTutorialFailure(errorMessage))
      dispatch(addErrorNotification(error))
      onFailAction?.(error?.response?.data?.error)
    }
  }
}

export function deleteCustomTutorial(id: string, onSuccessAction?: () => void, onFailAction?: () => void) {
  return async (dispatch: AppDispatch) => {
    dispatch(deleteWbCustomTutorial())
    try {
      const { status } = await apiService.delete(`${ApiEndpoints.CUSTOM_TUTORIALS}/${id}`)
      if (isStatusSuccessful(status)) {
        dispatch(deleteWBCustomTutorialSuccess(id))
        onSuccessAction?.()
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(deleteWBCustomTutorialFailure(errorMessage))
      dispatch(addErrorNotification(error))
      onFailAction?.()
    }
  }
}
