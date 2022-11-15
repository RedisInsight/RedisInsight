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
const clientCertsSlice = createSlice({
  name: 'clientCerts',
  initialState,
  reducers: {
    // load client certificates
    loadClientCerts: (state) => {
      state.loading = true
      state.error = ''
    },
    loadClientCertsSuccess: (state, { payload }) => {
      state.data = payload
      state.loading = false
    },
    loadClientCertsFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
  },
})

// Actions generated from the slice
export const {
  loadClientCerts,
  loadClientCertsSuccess,
  loadClientCertsFailure,
} = clientCertsSlice.actions

// A selector
export const clientCertsSelector = (state: RootState) =>
  state.connections.clientCerts

// The reducer
export default clientCertsSlice.reducer

// Asynchronous thunk action
export function fetchClientCerts() {
  return async (dispatch: AppDispatch) => {
    dispatch(loadClientCerts())

    try {
      const { data, status } = await apiService.get(
        `${ApiEndpoints.CLIENT_CERTIFICATES}`
      )

      if (isStatusSuccessful(status)) {
        dispatch(loadClientCertsSuccess(data))
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(loadClientCertsFailure(errorMessage))
      dispatch(addErrorNotification(error))
    }
  }
}
