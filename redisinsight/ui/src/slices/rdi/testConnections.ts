import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AxiosError } from 'axios'
import { apiService, } from 'uiSrc/services'
import { addErrorNotification } from 'uiSrc/slices/app/notifications'
import { getApiErrorMessage, getRdiUrl, isStatusSuccessful } from 'uiSrc/utils'
import { IStateRdiTestConnections, ITestConnection } from 'uiSrc/slices/interfaces'

import { ApiEndpoints } from 'uiSrc/constants'
import { AppDispatch, RootState } from '../store'

export const initialState: IStateRdiTestConnections = {
  loading: false,
  error: '',
  results: null,
}

const rdiTestConnectionsSlice = createSlice({
  name: 'testConnections',
  initialState,
  reducers: {
    setInitialDryRunJob: () => initialState,
    testConnections: (state) => {
      state.loading = true
      state.results = null
    },
    testConnectionsSuccess: (state, { payload }: PayloadAction<ITestConnection>) => {
      state.loading = false
      state.results = payload
      state.error = ''
    },
    testConnectionsFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
      state.results = null
    },
  }
})

export const rdiTestConnectionsSelector = (state: RootState) => state.rdi.testConnections

export const {
  testConnections,
  testConnectionsSuccess,
  testConnectionsFailure,
} = rdiTestConnectionsSlice.actions

// The reducer
export default rdiTestConnectionsSlice.reducer

// Asynchronous thunk action
export function testConnectionsAction(
  rdiInstanceId: string,
  config: string,
  onSuccessAction?: () => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(testConnections())
      const { status, data } = await apiService.post(
        getRdiUrl(rdiInstanceId, ApiEndpoints.RDI_TEST_CONNECTIONS),
        config,
      )

      if (isStatusSuccessful(status)) {
        dispatch(testConnectionsSuccess(data))
        onSuccessAction?.()
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(testConnectionsFailure(errorMessage))
      onFailAction?.()
    }
  }
}
