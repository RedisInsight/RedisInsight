import { AxiosError } from 'axios'
import { createSlice } from '@reduxjs/toolkit'
import { CloudUser } from 'src/modules/cloud/user/cloud-user.model'
import { apiService } from 'uiSrc/services'
import { ApiEndpoints } from 'uiSrc/constants'
import { getApiErrorMessage, isStatusSuccessful } from 'uiSrc/utils'

import { AppDispatch, RootState } from '../store'
import { StateUserProfile } from '../interfaces/user'

export const initialState: StateUserProfile = {
  loading: false,
  error: '',
  data: undefined,
}

const cloudUserProfileSlice = createSlice({
  name: 'cloudUserProfile',
  initialState,
  reducers: {
    setUserProfileInitialState: () => initialState,
    getUserProfile: (state) => {
      state.loading = true
    },
    getUserProfileSuccess: (state, { payload }) => {
      state.loading = false
      state.data = payload
    },
    getUserProfileFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
  },
})

// Actions generated from the slice
export const {
  setUserProfileInitialState,
  getUserProfile,
  getUserProfileSuccess,
  getUserProfileFailure,
} = cloudUserProfileSlice.actions

// A selector
export const cloudUserProfileSelector = (state: RootState) => state.user.cloudProfile

// The reducer
export default cloudUserProfileSlice.reducer

// Asynchronous thunk action
export function fetchCloudUserProfile(onSuccessAction?: () => void, onFailAction?: () => void) {
  return async (dispatch: AppDispatch) => {
    dispatch(getUserProfile())

    try {
      const { data, status } = await apiService.get<CloudUser>(ApiEndpoints.CLOUD_USER_PROFILE)

      if (isStatusSuccessful(status)) {
        dispatch(getUserProfileSuccess(data))
        onSuccessAction?.()
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error as AxiosError)
      dispatch(getUserProfileFailure(errorMessage))
      onFailAction?.()
    }
  }
}
