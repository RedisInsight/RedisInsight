import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AxiosError } from 'axios'
import { apiService } from 'uiSrc/services'
import { ApiEndpoints } from 'uiSrc/constants'
import { getApiErrorMessage, isStatusSuccessful, Nullable } from 'uiSrc/utils'

import { AppDispatch, RootState } from '../store'
import { SignInDialogSource, StateAppOAuth } from '../interfaces'

export const initialState: StateAppOAuth = {
  loading: true,
  error: '',
  signInDialog: {
    isOpen: false,
    source: null,
  },
  currentAccount: null,
}

// A slice for recipes
const oauthCloudSlice = createSlice({
  name: 'oauthCloud',
  initialState,
  reducers: {
    setOAuthInitialState: () => initialState,

    signIn: (state) => {
      state.loading = true
    },
    signInSuccess: (state, { payload }) => {
      state.loading = false
    },
    signInFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
    getAccountInfo: (state) => {
      state.loading = true
    },
    getAccountInfoSuccess: (state, { payload }: PayloadAction<any>) => {
      state.loading = false
      state.currentAccount = payload
    },
    getAccountInfoFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
    setSignInDialogState: (state, { payload }: PayloadAction<Nullable<SignInDialogSource>>) => {
      state.signInDialog = {
        isOpen: !!payload,
        source: payload,
      }
    },
  },
})

// Actions generated from the slice
export const {
  setOAuthInitialState,
  signIn,
  signInSuccess,
  signInFailure,
  getAccountInfo,
  getAccountInfoSuccess,
  getAccountInfoFailure,
  setSignInDialogState,
} = oauthCloudSlice.actions

// A selector
export const oauthCloudSelector = (state: RootState) => state.oauth.cloud
export const oauthCloudSignInDialogSelector = (state: RootState) => state.oauth.cloud.signInDialog
export const oauthCloudAccountSelector = (state: RootState) => state.oauth.cloud.currentAccount

// The reducer
export default oauthCloudSlice.reducer

// Asynchronous thunk action
export function fetchAccountInfo(onSuccessAction?: () => void, onFailAction?: () => void) {
  return async (dispatch: AppDispatch) => {
    dispatch(getAccountInfo())

    try {
      const { data, status } = await apiService.get<any>(ApiEndpoints.CLOUD_ME)

      if (isStatusSuccessful(status)) {
        dispatch(getAccountInfoSuccess(data))
        onSuccessAction?.()
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(getAccountInfoFailure(errorMessage))
      onFailAction?.()
    }
  }
}
