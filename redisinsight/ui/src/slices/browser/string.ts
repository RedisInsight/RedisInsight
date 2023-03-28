import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ApiEndpoints, KeyTypes } from 'uiSrc/constants'
import { apiService } from 'uiSrc/services'
import { getApiErrorMessage, getUrl, isStatusSuccessful, Maybe } from 'uiSrc/utils'
import { getBasedOnViewTypeEvent, sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import { refreshKeyInfoAction } from './keys'
import { addErrorNotification } from '../app/notifications'
import { AppDispatch, RootState } from '../store'
import { StringState } from '../interfaces/string'
import { RedisResponseBuffer } from '../interfaces'

export const initialState: StringState = {
  loading: false,
  error: '',
  data: {
    key: '',
    value: null,
  },
}

// A slice for recipes
const stringSlice = createSlice({
  name: 'string',
  initialState,
  reducers: {
    // load String value
    getString: (state, { payload: resetData = true }: PayloadAction<Maybe<boolean>>) => {
      state.loading = true
      state.error = ''

      if (resetData) {
        state.data = initialState.data
      }
    },
    getStringSuccess: (state, { payload }) => {
      state.data.key = payload.keyName
      state.data.value = payload.value
      state.loading = false
    },
    getStringFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
    updateValue: (state) => {
      state.loading = true
      state.error = ''
    },
    updateValueSuccess: (state, { payload }) => {
      state.loading = false
      state.data.value = payload
    },
    updateValueFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
    resetStringValue: (state) => {
      state.data.key = ''
      state.data.value = null
    },
    setIsStringCompressed: (state, { payload }: PayloadAction<boolean>) => {
      state.isCompressed = payload
    },
  },
})

// Actions generated from the slice
export const {
  getString,
  getStringSuccess,
  getStringFailure,
  updateValue,
  updateValueSuccess,
  updateValueFailure,
  resetStringValue,
  setIsStringCompressed,
} = stringSlice.actions

// A selector
export const stringSelector = (state: RootState) => state.browser.string
export const stringDataSelector = (state: RootState) =>
  state.browser.string?.data

// The reducer
export default stringSlice.reducer

// Asynchronous thunk action
export function fetchString(key: RedisResponseBuffer, resetData?: boolean) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(getString(resetData))

    try {
      const state = stateInit()
      const { encoding } = state.app.info
      const { data, status } = await apiService.post(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          ApiEndpoints.STRING_VALUE
        ),
        {
          keyName: key,
        },
        { params: { encoding } },
      )

      if (isStatusSuccessful(status)) {
        dispatch(getStringSuccess(data))
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(getStringFailure(errorMessage))
    }
  }
}

// Asynchronous thunk action
export function updateStringValueAction(
  key: RedisResponseBuffer,
  value: RedisResponseBuffer,
  onSuccess?: (value: RedisResponseBuffer) => void,
  onFailed?: () => void
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(updateValue())

    try {
      const state = stateInit()
      const { encoding } = state.app.info
      const { status } = await apiService.put(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          ApiEndpoints.STRING
        ),
        {
          keyName: key,
          value,
        },
        { params: { encoding } },
      )

      if (isStatusSuccessful(status)) {
        sendEventTelemetry({
          event: getBasedOnViewTypeEvent(
            state.browser.keys?.viewType,
            TelemetryEvent.BROWSER_KEY_VALUE_EDITED,
            TelemetryEvent.TREE_VIEW_KEY_VALUE_EDITED
          ),
          eventData: {
            databaseId: state.connections.instances?.connectedInstance?.id,
            keyType: KeyTypes.String,
          }
        })
        dispatch(updateValueSuccess(value))
        dispatch<any>(refreshKeyInfoAction(key))
        onSuccess?.(value)
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(updateValueFailure(errorMessage))
      onFailed?.()
    }
  }
}
