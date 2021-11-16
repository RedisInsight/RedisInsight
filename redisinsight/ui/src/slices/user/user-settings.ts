import { createSlice } from '@reduxjs/toolkit'
import { apiService } from 'uiSrc/services'
import { ApiEndpoints } from 'uiSrc/constants'
import { getApiErrorMessage, isStatusSuccessful } from 'uiSrc/utils'
import { addErrorNotification } from 'uiSrc/slices/app/notifications'
import { GetAgreementsSpecResponse, GetAppSettingsResponse, UpdateSettingsDto } from 'apiSrc/dto/settings.dto'

import { AppDispatch, RootState } from '../store'
import { StateUserSettings } from '../interfaces/user'

export const initialState: StateUserSettings = {
  loading: false,
  error: '',
  isShowConceptsPopup: false,
  config: null,
  spec: null,
}

// A slice for recipes
const userSettingsSlice = createSlice({
  name: 'userSettings',
  initialState,
  reducers: {
    setUserSettingsInitialState: () => initialState,
    setSettingsPopupState: (state, { payload }) => {
      state.isShowConceptsPopup = payload
    },
    getUserConfigSettings: (state) => {
      state.loading = true
    },
    getUserConfigSettingsSuccess: (state, { payload }) => {
      state.loading = false
      state.config = payload
    },
    getUserConfigSettingsFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
    updateUserConfigSettings: (state) => {
      state.loading = true
    },
    updateUserConfigSettingsSuccess: (state, { payload }) => {
      state.loading = false
      state.config = payload
      state.isShowConceptsPopup = false
    },
    updateUserConfigSettingsFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
    getUserSettingsSpec: (state) => {
      state.loading = true
    },
    getUserSettingsSpecSuccess: (state, { payload }) => {
      state.loading = false
      state.spec = payload
    },
    getUserSettingsSpecFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
  },
})

// Actions generated from the slice
export const {
  setUserSettingsInitialState,
  setSettingsPopupState,
  getUserConfigSettings,
  getUserConfigSettingsSuccess,
  getUserConfigSettingsFailure,
  updateUserConfigSettings,
  updateUserConfigSettingsSuccess,
  updateUserConfigSettingsFailure,
  getUserSettingsSpec,
  getUserSettingsSpecSuccess,
  getUserSettingsSpecFailure,
} = userSettingsSlice.actions

// A selector
export const userSettingsSelector = (state: RootState) => state.user.settings

// The reducer
export default userSettingsSlice.reducer

// Asynchronous thunk action
export function fetchAppInfo(onSuccessAction?: () => void, onFailAction?: () => void) {
  return async (dispatch: AppDispatch) => {
    dispatch(getUserConfigSettings())

    try {
      const { data, status } = await apiService.get<GetAppSettingsResponse>(ApiEndpoints.INFO)

      if (isStatusSuccessful(status)) {
        dispatch(getUserConfigSettingsSuccess(data))
        onSuccessAction?.()
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(getUserConfigSettingsFailure(errorMessage))
      onFailAction?.()
    }
  }
}

// Asynchronous thunk action
export function fetchUserConfigSettings(onSuccessAction?: () => void, onFailAction?: () => void) {
  return async (dispatch: AppDispatch) => {
    dispatch(getUserConfigSettings())

    try {
      const { data, status } = await apiService.get<GetAppSettingsResponse>(ApiEndpoints.SETTINGS)

      if (isStatusSuccessful(status)) {
        dispatch(getUserConfigSettingsSuccess(data))
        onSuccessAction?.()
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(getUserConfigSettingsFailure(errorMessage))
      onFailAction?.()
    }
  }
}

// Asynchronous thunk action
export function fetchUserSettingsSpec(onSuccessAction?: () => void, onFailAction?: () => void) {
  return async (dispatch: AppDispatch) => {
    dispatch(getUserSettingsSpec())

    try {
      const { data, status } = await apiService.get<GetAgreementsSpecResponse>(
        ApiEndpoints.SETTINGS_AGREEMENTS_SPEC
      )

      if (isStatusSuccessful(status)) {
        dispatch(getUserSettingsSpecSuccess(data))
        onSuccessAction?.()
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(getUserSettingsSpecFailure(errorMessage))
      onFailAction?.()
    }
  }
}

// Asynchronous thunk action
export function updateUserConfigSettingsAction(
  settings: any,
  onSuccessAction?: () => void,
  onFailAction?: () => void
) {
  return async (dispatch: AppDispatch) => {
    dispatch(updateUserConfigSettings())

    try {
      const { status, data } = await apiService.patch<UpdateSettingsDto>(
        ApiEndpoints.SETTINGS,
        settings
      )

      if (isStatusSuccessful(status)) {
        dispatch(updateUserConfigSettingsSuccess(data))
        onSuccessAction?.()
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(updateUserConfigSettingsFailure(errorMessage))
      dispatch(addErrorNotification(error))
      onFailAction?.()
    }
  }
}
