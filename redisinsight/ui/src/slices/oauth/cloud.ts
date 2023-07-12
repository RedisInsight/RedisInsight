import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AxiosError } from 'axios'
import { apiService } from 'uiSrc/services'
import { ApiEndpoints, Pages } from 'uiSrc/constants'
import { getApiErrorMessage, isStatusSuccessful, Nullable } from 'uiSrc/utils'

import { CloudJobs } from 'uiSrc/electron/constants'
import {
  INFINITE_MESSAGES,
  InfiniteMessagesIds
} from 'uiSrc/components/notifications/components'
import { CloudUser } from 'apiSrc/modules/cloud/user/models'
import { AppDispatch, RootState } from '../store'
import { Instance, OAuthSocialSource, StateAppOAuth } from '../interfaces'
import { addErrorNotification, addInfiniteNotification, removeInfiniteNotification } from '../app/notifications'
import { checkConnectToInstanceAction, fetchInstancesAction } from '../instances/instances'

export const initialState: StateAppOAuth = {
  loading: false,
  error: '',
  message: '',
  source: null,
  isOpenSignInDialog: false,
  isOpenSelectAccountDialog: false,
  user: {
    loading: false,
    error: '',
    data: null,
    freeDb: {
      loading: false,
      error: '',
      data: null,
    },
  }
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
    signInSuccess: (state, { payload }: PayloadAction<string>) => {
      state.loading = false
      state.error = ''
      state.message = payload
    },
    signInFailure: (state, { payload }: PayloadAction<string>) => {
      state.loading = false
      state.error = payload
    },
    getUserInfo: (state) => {
      state.user.loading = true
    },
    getUserInfoSuccess: (state, { payload }: PayloadAction<CloudUser>) => {
      state.user.loading = false
      state.user.data = payload
    },
    getUserInfoFailure: (state, { payload }: PayloadAction<string>) => {
      state.user.loading = false
      state.user.error = payload
    },
    addFreeDb: (state) => {
      state.user.freeDb.loading = true
    },
    addFreeDbSuccess: (state, { payload }: PayloadAction<Instance>) => {
      state.user.freeDb.loading = false
      state.user.freeDb.data = payload
    },
    addFreeDbFailure: (state, { payload }: PayloadAction<string>) => {
      state.user.freeDb.loading = false
      state.user.freeDb.error = payload
    },
    setSignInDialogState: (state, { payload }: PayloadAction<Nullable<OAuthSocialSource>>) => {
      state.source = payload
      state.isOpenSignInDialog = !!payload
    },
    setOAuthCloudSource: (state, { payload }: PayloadAction<Nullable<OAuthSocialSource>>) => {
      state.source = payload
    },
    setSelectAccountDialogState: (state, { payload }: PayloadAction<boolean>) => {
      state.isOpenSelectAccountDialog = payload
    },
  },
})

// Actions generated from the slice
export const {
  setOAuthInitialState,
  signIn,
  signInSuccess,
  signInFailure,
  getUserInfo,
  getUserInfoSuccess,
  getUserInfoFailure,
  addFreeDb,
  addFreeDbSuccess,
  addFreeDbFailure,
  setSignInDialogState,
  setOAuthCloudSource,
  setSelectAccountDialogState,
} = oauthCloudSlice.actions

// A selector
export const oauthCloudSelector = (state: RootState) => state.oauth.cloud
export const oauthCloudUserSelector = (state: RootState) => state.oauth.cloud.user
export const oauthCloudUserDataSelector = (state: RootState) => state.oauth.cloud.user.data

// The reducer
export default oauthCloudSlice.reducer

export function createFreeDbSuccess(history: any) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    try {
      const state = stateInit()
      const { id: firstInstanceId } = state.connections.instances.data?.[0]
      const { id = firstInstanceId } = state.oauth.cloud.user?.freeDb?.data ?? {}

      const onConnect = () => {
        dispatch(checkConnectToInstanceAction(
          id,
          () => {
            dispatch(removeInfiniteNotification(InfiniteMessagesIds.oAuth))
            history.push(Pages.browser(id))
          },
          () => {
            dispatch(removeInfiniteNotification(InfiniteMessagesIds.oAuth))
          }
        ))
      }

      dispatch(addInfiniteNotification(INFINITE_MESSAGES.SUCCESS_CREATE_DB(onConnect)))
      dispatch(setSignInDialogState(null))
      dispatch(setSelectAccountDialogState(false))
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(addFreeDbFailure(errorMessage))
    }
  }
}

// Asynchronous thunk action
export function fetchUserInfo(onSuccessAction?: (isMultiAccount: boolean) => void, onFailAction?: () => void) {
  return async (dispatch: AppDispatch) => {
    dispatch(getUserInfo())

    try {
      const { data, status } = await apiService.get<CloudUser>(ApiEndpoints.CLOUD_ME)

      if (isStatusSuccessful(status)) {
        const isMultiAccount = (data?.accounts?.length ?? 0) > 1
        if (isMultiAccount) {
          dispatch(setSelectAccountDialogState(true))
        }

        dispatch(getUserInfoSuccess(data))
        dispatch(setSignInDialogState(null))

        onSuccessAction?.(isMultiAccount)
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(getUserInfoFailure(errorMessage))
      onFailAction?.()
    }
  }
}

// Asynchronous thunk action
export function createFreeDb(onSuccessAction?: (instance: Instance) => void, onFailAction?: () => void) {
  return async (dispatch: AppDispatch) => {
    dispatch(addFreeDb())

    try {
      const { data, status } = await apiService.post<Instance>(
        ApiEndpoints.CLOUD_ME_JOBS,
        { name: CloudJobs.CREATE_FREE_DATABASE }
      )

      if (isStatusSuccessful(status)) {
        dispatch(fetchInstancesAction())
        dispatch(addFreeDbSuccess(data))
        onSuccessAction?.(data)
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(addFreeDbFailure(errorMessage))
      onFailAction?.()
    }
  }
}

// Asynchronous thunk action
export function activateAccount(
  id: string,
  onSuccessAction?: () => void,
  onFailAction?: (error: string) => void
) {
  return async (dispatch: AppDispatch) => {
    dispatch(getUserInfo())

    try {
      const { data, status } = await apiService.put<CloudUser>(
        [
          ApiEndpoints.CLOUD_ME_ACCOUNTS,
          id,
          ApiEndpoints.CLOUD_CURRENT,
        ].join('/'),
      )

      if (isStatusSuccessful(status)) {
        dispatch(getUserInfoSuccess(data))
        onSuccessAction?.()
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(getUserInfoFailure(errorMessage))
      onFailAction?.(errorMessage)
    }
  }
}
