import { createSlice } from '@reduxjs/toolkit'
import { AxiosError } from 'axios'

import apiService, { setCSRFHeader } from 'uiSrc/services/apiService'
import { getApiErrorMessage, isStatusSuccessful } from 'uiSrc/utils'
import { AppDispatch, RootState } from '../store'

export interface StateCsrf {
  loading: boolean;
  error: string;
  csrfToken: string;
}

export const initialState: StateCsrf = {
  loading: true,
  error: '',
  csrfToken: '',
}

interface CSRFTokenResponse {
  csrfToken: {
    csrf_token: string;
    csrf_enabled: boolean;
    errors?: [];
  };
}

// A slice for recipes
const csrfSlice = createSlice({
  name: 'csrf',
  initialState,
  reducers: {
    setCsrfInitialState: () => initialState,
    getCsrfToken: (state) => {
      state.loading = true
    },
    getCsrfTokenSuccess: (state, { payload }) => {
      state.loading = false
      state.csrfToken = payload
    },
    getCsrfTokenFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
  },
})

// Actions generated from the slice
export const {
  setCsrfInitialState,
  getCsrfToken,
  getCsrfTokenSuccess,
  getCsrfTokenFailure
} = csrfSlice.actions

// Selectors
export const csrfSelector = (state: RootState) =>
  state.app.csrf

// The reducer
export default csrfSlice.reducer

// TODO: remove this
function timeout(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Asynchronous thunk action
export function fetchCsrfToken(
  onSuccessAction?: (data: any) => void,
  onFailAction?: () => void
) {
  return async (dispatch: AppDispatch) => {
    dispatch(getCsrfToken())

    try {
      // TODO: put URL in env
      const { data, status } = await apiService.get<CSRFTokenResponse>('https://app-sm.k8s-mw.sm-qa.qa.redislabs.com/api/v1/csrf')

      // TODO: remove this
      timeout(5000)

      if (isStatusSuccessful(status)) {
        dispatch(getCsrfTokenSuccess(data))
        setCSRFHeader(data.csrfToken.csrf_token)
        onSuccessAction?.(data)
      }
    } catch (error) {
      const errorMessage: string = getApiErrorMessage(error as AxiosError)
      dispatch(getCsrfTokenFailure(errorMessage))
      onFailAction?.()
    }
  }
}
