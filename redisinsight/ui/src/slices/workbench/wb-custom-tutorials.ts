import { createSlice } from '@reduxjs/toolkit'
import { ApiEndpoints } from 'uiSrc/constants'
import { getApiErrorMessage, isStatusSuccessful, } from 'uiSrc/utils'
import { apiService } from 'uiSrc/services'
import {
  DefaultCustomTutorialsItems,
  EnablementAreaComponent,
  IEnablementAreaItem,
  StateWorkbenchCustomTutorials,
} from 'uiSrc/slices/interfaces'

import { addErrorNotification } from 'uiSrc/slices/app/notifications'
import { AppDispatch, RootState } from '../store'

export const defaultItems: DefaultCustomTutorialsItems = {
  'custom-tutorials': {
    id: 'custom-tutorials',
    label: 'MY TUTORIALS',
    type: EnablementAreaComponent.Group,
    children: {}
  }
}
export const initialState: StateWorkbenchCustomTutorials = {
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
    getWBCustomTutorialsSuccess: (state, { payload }) => {
      state.loading = false
      state.items = payload
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
      state.items['custom-tutorials'] = {
        ...state.items['custom-tutorials'],
        children: {
          [payload.id]: payload,
          ...state.items['custom-tutorials'].children,
        },
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
      delete state.items['custom-tutorials'].children?.[payload]
    },
    deleteWBCustomTutorialFailure: (state, { payload }) => {
      state.loading = false
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

export function uploadCustomTutorial(
  formData: FormData,
  onSuccessAction?: () => void,
  onFailAction?: () => void
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
      onFailAction?.()
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
