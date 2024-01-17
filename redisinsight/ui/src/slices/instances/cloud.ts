import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { cloneDeep, find, map } from 'lodash'

import { ApiEndpoints } from 'uiSrc/constants'
import { apiService } from 'uiSrc/services'
import {
  getApiErrorMessage,
  getApiErrorsFromBulkOperation,
  getAxiosError,
  isStatusSuccessful,
  Maybe,
  Nullable,
} from 'uiSrc/utils'
import { ApiEncryptionErrors } from 'uiSrc/constants/apiErrors'
import {
  EnhancedAxiosError,
  ICredentialsRedisCloud,
  InitialStateCloud,
  InstanceRedisCloud,
  LoadedCloud,
} from '../interfaces'
import { addErrorNotification } from '../app/notifications'
import { AppDispatch, RootState } from '../store'

export const initialState: InitialStateCloud = {
  loading: false,
  error: '',
  data: null,
  dataAdded: [],
  subscriptions: null,
  credentials: null,
  isAutodiscoverySSO: false,
  isRecommendedSettings: undefined,
  account: {
    error: '',
    data: null,
  },
  loaded: {
    [LoadedCloud.Subscriptions]: false,
    [LoadedCloud.Instances]: false,
    [LoadedCloud.InstancesAdded]: false,
  },
}

// A slice for recipes
const cloudSlice = createSlice({
  name: 'cloud',
  initialState,
  reducers: {
    // load redis cloud subscriptions
    loadSubscriptionsRedisCloud: (state) => {
      state.loading = true
      state.error = ''
    },
    loadSubscriptionsRedisCloudSuccess: (state, { payload }) => {
      state.loading = false
      state.loaded[LoadedCloud.Subscriptions] = true

      state.subscriptions = payload?.data
      state.credentials = payload?.credentials
    },
    loadSubscriptionsRedisCloudFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },

    // load redis cloud account
    loadAccountRedisCloud: (state) => {
      state.loading = true
      state.error = ''
    },
    loadAccountRedisCloudSuccess: (state, { payload }) => {
      state.loading = false
      state.account = {
        data: payload?.data,
        error: '',
      }
    },
    loadAccountRedisCloudFailure: (state, { payload }) => {
      state.loading = false
      state.account = {
        data: null,
        error: payload,
      }
    },

    // load redis cloud instances
    loadInstancesRedisCloud: (state) => {
      state.loading = true
      state.error = ''
    },
    loadInstancesRedisCloudSuccess: (state, { payload }) => {
      state.loading = false
      state.loaded[LoadedCloud.Instances] = true

      state.data = map(payload?.data, (instance) => ({
        ...instance,
        free: !!instance?.cloudDetails?.free,
        subscriptionName:
          find(
            state.subscriptions,
            (subscription) => subscription.id === instance.subscriptionId
          )?.name ?? '',
      }))
    },
    loadInstancesRedisCloudFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },

    // add  redis cloud instances
    createInstancesRedisCloud: (state) => {
      state.loading = true
      state.error = ''
    },
    createInstancesRedisCloudSuccess: (state, { payload }) => {
      state.loading = false

      state.loaded[LoadedCloud.InstancesAdded] = true

      state.dataAdded = payload?.map((instance: InstanceRedisCloud) => ({
        ...instance.databaseDetails || {},
        databaseIdAdded: instance.databaseId,
        subscriptionIdAdded: instance.subscriptionId,
        statusAdded: instance.status,
        messageAdded: instance.message,
        subscriptionName:
          find(
            state.subscriptions,
            (subscription) => subscription.id === instance.subscriptionId
          )?.name ?? '',
      }))
    },
    createInstancesRedisCloudFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },

    // reset data for cloud slice
    resetDataRedisCloud: () => cloneDeep(initialState),
    // reset data for cloud slice
    resetSubscriptionsRedisCloud: (state) => {
      state.subscriptions = null
      state.data = null
      state.dataAdded = []
    },

    // reset loaded field by LoadedCloud for cloud slice
    resetLoadedRedisCloud: (state, { payload }: PayloadAction<LoadedCloud>) => {
      state.loaded[payload] = false
    },
    setIsAutodiscoverySSO: (state, { payload }: PayloadAction<boolean>) => {
      state.isAutodiscoverySSO = payload
    },
    setIsRecommendedSettingsSSO: (state, { payload }: PayloadAction<Maybe<boolean>>) => {
      state.isRecommendedSettings = payload
    },
  },
})

// Actions generated from the slice
export const {
  loadSubscriptionsRedisCloud,
  loadSubscriptionsRedisCloudSuccess,
  loadSubscriptionsRedisCloudFailure,
  loadAccountRedisCloud,
  loadAccountRedisCloudSuccess,
  loadAccountRedisCloudFailure,
  loadInstancesRedisCloud,
  loadInstancesRedisCloudSuccess,
  loadInstancesRedisCloudFailure,
  createInstancesRedisCloud,
  createInstancesRedisCloudSuccess,
  createInstancesRedisCloudFailure,
  resetDataRedisCloud,
  resetSubscriptionsRedisCloud,
  resetLoadedRedisCloud,
  setIsAutodiscoverySSO,
  setIsRecommendedSettingsSSO
} = cloudSlice.actions

// A selector
export const cloudSelector = (state: RootState) => state.connections.cloud

// The reducer
export default cloudSlice.reducer

const generateAuthHeaders = (credentials: Nullable<ICredentialsRedisCloud>) => ({
  'x-cloud-api-key': credentials?.accessKey || '',
  'x-cloud-api-secret': credentials?.secretKey || '',
})

// Asynchronous thunk action
export function fetchSubscriptionsRedisCloud(
  credentials: Nullable<ICredentialsRedisCloud>,
  onSuccessAction?: () => void,
  onFailAction?: () => void
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(loadSubscriptionsRedisCloud())

    try {
      const state = stateInit()
      const { isAutodiscoverySSO } = state.connections.cloud
      const { data, status } = await apiService.get(
        isAutodiscoverySSO
          ? `${ApiEndpoints.CLOUD_ME_AUTODISCOVERY_SUBSCRIPTIONS}`
          : `${ApiEndpoints.REDIS_CLOUD_SUBSCRIPTIONS}`,
        {
          headers: {
            ...(!isAutodiscoverySSO ? generateAuthHeaders(credentials) : {}),
          }
        }
      )

      if (isStatusSuccessful(status)) {
        dispatch(
          loadSubscriptionsRedisCloudSuccess({
            data,
            credentials,
          })
        )
        onSuccessAction?.()
        dispatch<any>(fetchAccountRedisCloud(credentials))
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error as EnhancedAxiosError)
      const err = getAxiosError(error as EnhancedAxiosError)

      dispatch(loadSubscriptionsRedisCloudFailure(errorMessage))
      dispatch(addErrorNotification(err))
      onFailAction?.()
    }
  }
}

// Asynchronous thunk action
export function fetchAccountRedisCloud(credentials: Nullable<ICredentialsRedisCloud>) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(loadAccountRedisCloud())

    try {
      const state = stateInit()
      const { isAutodiscoverySSO } = state.connections.cloud
      const { data, status } = await apiService.get(
        isAutodiscoverySSO
          ? `${ApiEndpoints.CLOUD_ME_AUTODISCOVERY_ACCOUNT}`
          : `${ApiEndpoints.REDIS_CLOUD_ACCOUNT}`,
        {
          headers: {
            ...(!isAutodiscoverySSO ? generateAuthHeaders(credentials) : {}),
          }
        }
      )

      if (isStatusSuccessful(status)) {
        dispatch(loadAccountRedisCloudSuccess({ data }))
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(loadAccountRedisCloudFailure(errorMessage))
      dispatch(addErrorNotification(error))
    }
  }
}

// Asynchronous thunk action
export function fetchInstancesRedisCloud(payload: {
  subscriptions: Maybe<Pick<InstanceRedisCloud, 'subscriptionId' | 'subscriptionType' | 'free'>>[];
  credentials: Nullable<ICredentialsRedisCloud>;
}) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(loadInstancesRedisCloud())

    try {
      const state = stateInit()
      const { isAutodiscoverySSO } = state.connections.cloud
      const { data, status } = await apiService.post(
        isAutodiscoverySSO
          ? `${ApiEndpoints.CLOUD_ME_AUTODISCOVERY_GET_DATABASES}`
          : `${ApiEndpoints.REDIS_CLOUD_GET_DATABASES}`,
        {
          subscriptions: payload.subscriptions,
        },
        {
          headers: {
            ...(!isAutodiscoverySSO ? generateAuthHeaders(payload.credentials) : {}),
          }
        }
      )

      if (isStatusSuccessful(status)) {
        dispatch(
          loadInstancesRedisCloudSuccess({ data, credentials: payload })
        )
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(loadInstancesRedisCloudFailure(errorMessage))
      dispatch(addErrorNotification(error))
    }
  }
}

// Asynchronous thunk action
export function addInstancesRedisCloud(payload: {
  databases: Pick<InstanceRedisCloud, 'subscriptionId' | 'databaseId' | 'free'>[];
  credentials: Nullable<ICredentialsRedisCloud>;
}) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(createInstancesRedisCloud())

    try {
      const state = stateInit()
      const { isAutodiscoverySSO } = state.connections.cloud
      const { data, status } = await apiService.post(
        isAutodiscoverySSO
          ? `${ApiEndpoints.CLOUD_ME_AUTODISCOVERY_DATABASES}`
          : `${ApiEndpoints.REDIS_CLOUD_DATABASES}`,
        {
          databases: payload.databases,
        },
        {
          headers: {
            ...(!isAutodiscoverySSO ? generateAuthHeaders(payload.credentials) : {}),
          }
        }
      )

      if (isStatusSuccessful(status)) {
        const encryptionErrors = getApiErrorsFromBulkOperation(data, ...ApiEncryptionErrors)
        if (encryptionErrors.length) {
          dispatch(addErrorNotification(encryptionErrors[0]))
        }
        dispatch(createInstancesRedisCloudSuccess(data))
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(createInstancesRedisCloudFailure(errorMessage))
      dispatch(addErrorNotification(error))
    }
  }
}
