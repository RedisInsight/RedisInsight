import { createSlice } from '@reduxjs/toolkit'
import { cloneDeep } from 'lodash'
import { ApiEndpoints } from 'uiSrc/constants'
import { apiService } from 'uiSrc/services'
import { getApiErrorMessage, getUrl, isStatusSuccessful } from 'uiSrc/utils'

import { refreshKeyInfoAction } from './keys'
import { addErrorNotification } from './app/notifications'
import { AppDispatch, RootState } from './store'
import { StringState } from './interfaces/string'

export const initialState: StringState = {
  loading: false,
  error: '',
  data: {
    key: '',
    value: null,
  },
}

// A slice for recipes
const stringSlice = createSlice({
  name: 'string',
  initialState,
  reducers: {
    // load String value
    getString: (state) => {
      state.loading = true
      state.error = ''
      state.data = cloneDeep(initialState.data)
    },
    getStringSuccess: (state, { payload }) => {
      state.data.key = payload.keyName
      state.data.value = payload.value
      state.loading = false
    },
    getStringFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
    updateValue: (state) => {
      state.loading = true
      state.error = ''
    },
    updateValueSuccess: (state, { payload }) => {
      state.loading = false
      state.data.value = payload
    },
    updateValueFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
    resetStringValue: (state) => {
      state.data.key = ''
      state.data.value = ''
    },
  },
})

// Actions generated from the slice
export const {
  getString,
  getStringSuccess,
  getStringFailure,
  updateValue,
  updateValueSuccess,
  updateValueFailure,
  resetStringValue,
} = stringSlice.actions

// A selector
export const stringSelector = (state: RootState) => state.browser.string
export const stringDataSelector = (state: RootState) =>
  state.browser.string?.data

// The reducer
export default stringSlice.reducer

// Asynchronous thunk action
export function fetchString(key: string) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(getString())

    try {
      const state = stateInit()
      const { data, status } = await apiService.post(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          ApiEndpoints.STRING_VALUE
        ),
        {
          keyName: key,
        }
      )

      if (isStatusSuccessful(status)) {
        dispatch(getStringSuccess(data))
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(getStringFailure(errorMessage))
    }
  }
}

// Asynchronous thunk action
export function updateStringValueAction(
  key: string,
  value: string,
  onSuccess?: () => void,
  onFailed?: () => void
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(updateValue())

    try {
      const state = stateInit()
      const { status } = await apiService.put(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          ApiEndpoints.STRING
        ),
        {
          keyName: key,
          value,
        }
      )

      if (isStatusSuccessful(status)) {
        dispatch(updateValueSuccess(value))
        dispatch<any>(refreshKeyInfoAction(key))
        onSuccess?.()
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(updateValueFailure(errorMessage))
      onFailed?.()
    }
  }
}
