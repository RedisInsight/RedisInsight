import { createSlice } from '@reduxjs/toolkit'
import { AxiosError } from 'axios'
import { StateTriggeredFunctions } from 'uiSrc/slices/interfaces/triggeredFunctions'
import { AppDispatch, RootState } from 'uiSrc/slices/store'
import { apiService } from 'uiSrc/services'
import { getApiErrorMessage, getUrl, isStatusSuccessful } from 'uiSrc/utils'
import { ApiEndpoints } from 'uiSrc/constants'
import { addErrorNotification } from 'uiSrc/slices/app/notifications'

export const initialState: StateTriggeredFunctions = {
  libraries: null,
  loading: false,
  lastRefresh: null,
  error: '',
}

const triggeredFunctionsSlice = createSlice({
  name: 'triggeredFunctions',
  initialState,
  reducers: {
    setTriggeredFunctionsInitialState: () => initialState,
    getTriggeredFunctionsList: (state) => {
      state.loading = true
      state.error = ''
    },
    getTriggeredFunctionsListSuccess: (state, { payload }) => {
      state.loading = false
      state.lastRefresh = Date.now()
      state.libraries = payload
    },
    getTriggeredFunctionsFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    }
  }
})

export const {
  setTriggeredFunctionsInitialState,
  getTriggeredFunctionsList,
  getTriggeredFunctionsListSuccess,
  getTriggeredFunctionsFailure,
} = triggeredFunctionsSlice.actions

export const triggeredFunctionsSelector = (state: RootState) => state.triggeredFunctions

export default triggeredFunctionsSlice.reducer

// Asynchronous thunk action
export function fetchTriggeredFunctionsLibrariesList(
  instanceId: string,
  onSuccessAction?: () => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(getTriggeredFunctionsList())

      const { data, status } = await apiService.get(
        getUrl(
          instanceId,
          ApiEndpoints.TRIGGERED_FUNCTIONS_LIBRARIES,
        )
      )

      if (isStatusSuccessful(status)) {
        dispatch(getTriggeredFunctionsListSuccess(data))
        onSuccessAction?.()
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(getTriggeredFunctionsFailure(errorMessage))
      onFailAction?.()
    }
  }
}
