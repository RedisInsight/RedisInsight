import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { cloneDeep, find, map } from 'lodash'

import { ApiEndpoints } from 'uiSrc/constants'
import { apiService } from 'uiSrc/services'
import {
  getApiErrorMessage,
  getApiErrorsFromBulkOperation,
  isStatusSuccessful,
  Maybe,
  Nullable,
} from 'uiSrc/utils'
import { ApiEncryptionErrors } from 'uiSrc/constants/apiErrors'
import {
  ICredentialsRedisCloud,
  InitialStateCloud,
  InstanceRedisCloud,
  LoadedCloud,
} from './interfaces'
import { addErrorNotification } from './app/notifications'
import { AppDispatch, RootState } from './store'

export const initialState: InitialStateCloud = {
  loading: false,
  error: '',
  data: null,
  dataAdded: [],
  subscriptions: null,
  credentials: null,
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
        ...instance.databaseDetails,
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
} = cloudSlice.actions

// A selector
export const cloudSelector = (state: RootState) => state.connections.cloud

// The reducer
export default cloudSlice.reducer

// Asynchronous thunk action
export function fetchSubscriptionsRedisCloud(
  { accessKey, secretKey }: ICredentialsRedisCloud,
  onSuccessAction?: () => void
) {
  return async (dispatch: AppDispatch) => {
    dispatch(loadSubscriptionsRedisCloud())

    try {
      const { data, status } = await apiService.post(
        `${ApiEndpoints.REDIS_CLOUD_SUBSCRIPTIONS}`,
        {
          apiKey: accessKey,
          apiSecretKey: secretKey,
        }
      )

      if (isStatusSuccessful(status)) {
        dispatch(
          loadSubscriptionsRedisCloudSuccess({
            data,
            credentials: { accessKey, secretKey },
          })
        )
        onSuccessAction?.()
        dispatch<any>(fetchAccountRedisCloud({ accessKey, secretKey }))
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(loadSubscriptionsRedisCloudFailure(errorMessage))
      dispatch(addErrorNotification(error))
    }
  }
}

// Asynchronous thunk action
export function fetchAccountRedisCloud(payload: ICredentialsRedisCloud) {
  return async (dispatch: AppDispatch) => {
    dispatch(loadAccountRedisCloud())

    try {
      const { data, status } = await apiService.post(
        `${ApiEndpoints.REDIS_CLOUD_ACCOUNT}`,
        {
          apiKey: payload?.accessKey,
          apiSecretKey: payload?.secretKey,
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
  ids: Maybe<number>[];
  credentials: Nullable<ICredentialsRedisCloud>;
}) {
  return async (dispatch: AppDispatch) => {
    dispatch(loadInstancesRedisCloud())

    try {
      const { data, status } = await apiService.post(
        `${ApiEndpoints.REDIS_CLOUD_DATABASES}`,
        {
          apiKey: payload.credentials?.accessKey,
          apiSecretKey: payload.credentials?.secretKey,
          subscriptionIds: payload.ids,
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
  databases: Pick<InstanceRedisCloud, 'subscriptionId' | 'databaseId'>[];
  credentials: Nullable<ICredentialsRedisCloud>;
}) {
  return async (dispatch: AppDispatch) => {
    dispatch(createInstancesRedisCloud())

    try {
      const { data, status } = await apiService.post(
        `${ApiEndpoints.INSTANCE_REDIS_CLOUD}`,
        {
          apiKey: payload.credentials?.accessKey,
          apiSecretKey: payload.credentials?.secretKey,
          databases: payload.databases,
        },
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
