import { createSlice } from '@reduxjs/toolkit'

import { ApiEndpoints } from 'uiSrc/constants'
import { apiService } from 'uiSrc/services'
import { getApiErrorMessage, isStatusSuccessful } from 'uiSrc/utils'
import { addErrorNotification } from '../app/notifications'
import { AppDispatch, RootState } from '../store'

export const initialState = {
  loading: false,
  error: '',
  data: [],
}

// A slice for recipes
const caCertsSlice = createSlice({
  name: 'caCerts',
  initialState,
  reducers: {
    // load ca certificates
    loadCaCerts: (state) => {
      state.loading = true
      state.error = ''
    },
    loadCaCertsSuccess: (state, { payload }) => {
      state.data = payload
      state.loading = false
    },
    loadCaCertsFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
  },
})

// Actions generated from the slice
export const {
  loadCaCerts,
  loadCaCertsSuccess,
  loadCaCertsFailure,
} = caCertsSlice.actions

// A selector
export const caCertsSelector = (state: RootState) => state.connections.caCerts

// The reducer
export default caCertsSlice.reducer

// Asynchronous thunk action
export function fetchCaCerts() {
  return async (dispatch: AppDispatch) => {
    dispatch(loadCaCerts())

    try {
      const { data, status } = await apiService.get(
        `${ApiEndpoints.CA_CERTIFICATES}`
      )

      if (isStatusSuccessful(status)) {
        dispatch(loadCaCertsSuccess(data))
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(loadCaCertsFailure(errorMessage))
    }
  }
}
