import { createSlice } from '@reduxjs/toolkit'

import { ApiEndpoints } from 'uiSrc/constants'
import { apiService } from 'uiSrc/services'
import { getApiErrorMessage, getAxiosError, isStatusSuccessful } from 'uiSrc/utils'
import { addErrorNotification } from '../app/notifications'
import { AppDispatch, RootState } from '../store'
import { EnhancedAxiosError } from '../interfaces'

export interface MicrosoftAuthSession {
  username: string | null;
  displayName: string | null;
  authenticated: boolean;
  idTokenClaims?: Record<string, any> | null;
  expiresOn?: Date | null;
  error?: string;
}

export interface MicrosoftAuthSessionsState {
  loading: boolean;
  error: string;
  data: Record<string, MicrosoftAuthSession>;
}

export const initialState: MicrosoftAuthSessionsState = {
  loading: false,
  error: '',
  data: {},
}

export const microsoftAuthSessionSlice = createSlice({
  name: 'microsoftAuthSession',
  initialState,
  reducers: {
    loadMicrosoftAuthSession: (state) => {
      state.loading = true
      state.error = ''
    },
    loadMicrosoftAuthSessionSuccess: (state, { payload }) => {
      state.loading = false
      // Store the session data indexed by the database ID
      state.data = {
        ...state.data,
        [payload.databaseId]: payload.data
      }
    },
    loadMicrosoftAuthSessionFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
    resetMicrosoftAuthSession: (state, { payload }) => {
      // Remove the session data for a specific database ID
      if (payload.databaseId && state.data[payload.databaseId]) {
        const newData = { ...state.data }
        delete newData[payload.databaseId]
        state.data = newData
      }
    },
    resetAllMicrosoftAuthSessions: (state) => {
      state.data = {}
    },
  },
})

export const {
  loadMicrosoftAuthSession,
  loadMicrosoftAuthSessionSuccess,
  loadMicrosoftAuthSessionFailure,
  resetMicrosoftAuthSession,
  resetAllMicrosoftAuthSessions,
} = microsoftAuthSessionSlice.actions

export const microsoftAuthSessionSelector = (state: RootState) => state.connections.microsoftAuthSession
export const selectMicrosoftAuthSessionByDatabaseId = (databaseId: string) =>
  (state: RootState) => state.connections.microsoftAuthSession.data[databaseId]

export default microsoftAuthSessionSlice.reducer

export function fetchMicrosoftAuthSession(databaseId: string) {
  return async (dispatch: AppDispatch) => {
    dispatch(loadMicrosoftAuthSession())

    try {
      // Construct the API URL with the database ID
      const endpoint = `${ApiEndpoints.MICROSOFT_AUTH_SESSION}/${databaseId}`
      const { data, status } = await apiService.get(endpoint)

      if (isStatusSuccessful(status)) {
        dispatch(
          loadMicrosoftAuthSessionSuccess({
            databaseId,
            data,
          })
        )
        return data
      }

      return {
        authenticated: false,
        username: null,
        displayName: null,
        error: `Invalid response status: ${status}`
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error as EnhancedAxiosError)
      const err = getAxiosError(error as EnhancedAxiosError)

      dispatch(loadMicrosoftAuthSessionFailure(errorMessage))
      dispatch(addErrorNotification(err))
      return {
        authenticated: false,
        username: null,
        displayName: null,
        error: errorMessage
      }
    }
  }
}