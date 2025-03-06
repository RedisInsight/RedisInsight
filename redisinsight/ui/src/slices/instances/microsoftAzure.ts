import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { cloneDeep, find, map } from 'lodash'

import { ApiEndpoints } from 'uiSrc/constants'
import { apiService } from 'uiSrc/services'
import {
  getApiErrorMessage,
  getAxiosError,
  isStatusSuccessful,
  Maybe,
} from 'uiSrc/utils'
import {
  EnhancedAxiosError,
  InitialStateAzure,
  AzureSubscription,
  LoadedAzure,
} from '../interfaces'
import { addErrorNotification } from '../app/notifications'
import { AppDispatch, RootState } from '../store'

export const initialState: InitialStateAzure = {
  loading: false,
  error: '',
  data: null,
  dataAdded: [],
  subscriptions: null,
  loaded: {
    [LoadedAzure.Subscriptions]: false,
    [LoadedAzure.Instances]: false,
    [LoadedAzure.InstancesAdded]: false,
  },
}

const azureSlice = createSlice({
  name: 'azure',
  initialState,
  reducers: {
    loadSubscriptionsAzure: (state) => {
      state.loading = true
      state.error = ''
    },
    loadSubscriptionsAzureSuccess: (state, { payload }) => {
      state.loading = false
      state.loaded[LoadedAzure.Subscriptions] = true
      state.subscriptions = payload?.data
    },
    loadSubscriptionsAzureFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
    loadInstancesAzure: (state) => {
      state.loading = true
      state.error = ''
    },
    loadInstancesAzureSuccess: (state, { payload }) => {
      state.loading = false
      state.loaded[LoadedAzure.Instances] = true

      state.data = map(payload?.data, (instance) => ({
        ...instance,
        subscriptionName:
          find(
            state.subscriptions,
            (subscription) => subscription.id === instance.subscriptionId
          )?.name ?? '',
      }))
    },
    loadInstancesAzureFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
    resetDataAzure: () => cloneDeep(initialState),
    resetSubscriptionsAzure: (state) => {
      state.subscriptions = null
      state.data = null
      state.dataAdded = []
    },
    resetLoadedAzure: (state, { payload }: PayloadAction<LoadedAzure>) => {
      state.loaded[payload] = false
    },
    addDatabasesAzure: (state, { payload }) => {
      state.dataAdded = payload.databases
      state.loaded[LoadedAzure.InstancesAdded] = true
    },
  },
})

export const {
  loadSubscriptionsAzure,
  loadSubscriptionsAzureSuccess,
  loadSubscriptionsAzureFailure,
  loadInstancesAzure,
  loadInstancesAzureSuccess,
  loadInstancesAzureFailure,
  resetDataAzure,
  resetSubscriptionsAzure,
  resetLoadedAzure,
  addDatabasesAzure,
} = azureSlice.actions

export const azureSelector = (state: RootState) => state.connections.azure

export default azureSlice.reducer

export function fetchSubscriptionsAzure() {
  return async (dispatch: AppDispatch) => {
    dispatch(loadSubscriptionsAzure())

    try {
      const { data, status } = await apiService.get(
        ApiEndpoints.MICROSOFT_AZURE_CLOUD_SUBSCRIPTIONS
      )
      if (isStatusSuccessful(status)) {
        dispatch(
          loadSubscriptionsAzureSuccess({
            data,
          })
        )
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error as EnhancedAxiosError)
      const err = getAxiosError(error as EnhancedAxiosError)

      dispatch(loadSubscriptionsAzureFailure(errorMessage))
      dispatch(addErrorNotification(err))
    }
  }
}

export function fetchInstancesAzure(
  payload: {
    subscriptions: Maybe<Pick<AzureSubscription, 'id'>>[],
  }
) {
  return async (dispatch: AppDispatch) => {
    dispatch(loadInstancesAzure())

    try {
      const { data, status } = await apiService.post(
        ApiEndpoints.MICROSOFT_AZURE_CLOUD_DATABASES,
        {
          subscriptions: payload.subscriptions,
        }
      )

      if (isStatusSuccessful(status)) {
        dispatch(
          loadInstancesAzureSuccess({ data })
        )
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error as EnhancedAxiosError)
      const err = getAxiosError(error as EnhancedAxiosError)

      dispatch(loadInstancesAzureFailure(errorMessage))
      dispatch(addErrorNotification(err))
    }
  }
}
