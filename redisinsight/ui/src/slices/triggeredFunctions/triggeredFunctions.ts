import { createSlice } from '@reduxjs/toolkit'
import { AxiosError } from 'axios'
import { StateTriggeredFunctions, TriggeredFunctionsLibraryDetails } from 'uiSrc/slices/interfaces/triggeredFunctions'
import { AppDispatch, RootState } from 'uiSrc/slices/store'
import { apiService } from 'uiSrc/services'
import { getApiErrorMessage, getUrl, isStatusSuccessful, Nullable } from 'uiSrc/utils'
import { ApiEndpoints } from 'uiSrc/constants'
import { addErrorNotification } from 'uiSrc/slices/app/notifications'

export const initialState: StateTriggeredFunctions = {
  libraries: null,
  selectedLibrary: {
    lastRefresh: null,
    loading: false,
    data: null
  },
  loading: false,
  lastRefresh: null,
  error: '',
}

const triggeredFunctionsSlice = createSlice({
  name: 'triggeredFunctions',
  initialState,
  reducers: {
    setTriggeredFunctionsInitialState: () => initialState,
    getTriggeredFunctionsLibrariesList: (state) => {
      state.loading = true
      state.error = ''
    },
    getTriggeredFunctionsLibrariesListSuccess: (state, { payload }) => {
      state.loading = false
      state.lastRefresh = Date.now()
      state.libraries = payload
    },
    getTriggeredFunctionsLibrariesListFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
    setTriggeredFunctionsSelectedLibrary: (state, { payload }) => {
      state.selectedLibrary.data = payload
    },
    getTriggeredFunctionsLibraryDetails: (state) => {
      state.selectedLibrary.loading = true
    },
    getTriggeredFunctionsLibraryDetailsSuccess: (state, { payload }) => {
      state.selectedLibrary.loading = false
      state.selectedLibrary.lastRefresh = Date.now()
      state.selectedLibrary.data = payload
    },
    getTriggeredFunctionsLibraryDetailsFailure: (state) => {
      state.selectedLibrary.loading = false
    },
    replaceTriggeredFunctionsLibrary: (state) => {
      state.selectedLibrary.loading = true
    },
    replaceTriggeredFunctionsLibrarySuccess: (state) => {
      state.selectedLibrary.loading = false
    },
    replaceTriggeredFunctionsLibraryFailure: (state) => {
      state.selectedLibrary.loading = false
    }
  }
})

export const {
  setTriggeredFunctionsInitialState,
  getTriggeredFunctionsLibrariesList,
  getTriggeredFunctionsLibrariesListSuccess,
  getTriggeredFunctionsLibrariesListFailure,
  setTriggeredFunctionsSelectedLibrary,
  getTriggeredFunctionsLibraryDetails,
  getTriggeredFunctionsLibraryDetailsSuccess,
  getTriggeredFunctionsLibraryDetailsFailure,
  replaceTriggeredFunctionsLibrary,
  replaceTriggeredFunctionsLibrarySuccess,
  replaceTriggeredFunctionsLibraryFailure,
} = triggeredFunctionsSlice.actions

export const triggeredFunctionsSelector = (state: RootState) => state.triggeredFunctions
export const triggeredFunctionsSelectedLibrarySelector = (state: RootState) => state.triggeredFunctions.selectedLibrary

export default triggeredFunctionsSlice.reducer

// Asynchronous thunk action
export function fetchTriggeredFunctionsLibrariesList(
  instanceId: string,
  onSuccessAction?: () => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(getTriggeredFunctionsLibrariesList())

      const { data, status } = await apiService.get(
        getUrl(
          instanceId,
          ApiEndpoints.TRIGGERED_FUNCTIONS_LIBRARIES,
        )
      )

      if (isStatusSuccessful(status)) {
        dispatch(getTriggeredFunctionsLibrariesListSuccess(data))
        onSuccessAction?.()
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(getTriggeredFunctionsLibrariesListFailure(errorMessage))
      onFailAction?.()
    }
  }
}

export function fetchTriggeredFunctionsLibrary(
  instanceId: string,
  libName: string,
  onSuccessAction?: (data: TriggeredFunctionsLibraryDetails) => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(getTriggeredFunctionsLibraryDetails())

      const { data, status } = await apiService.post(
        getUrl(
          instanceId,
          ApiEndpoints.TRIGGERED_FUNCTIONS_GET_LIBRARY,
        ),
        {
          libraryName: libName
        }
      )

      if (isStatusSuccessful(status)) {
        dispatch(getTriggeredFunctionsLibraryDetailsSuccess(data))
        onSuccessAction?.(data)
      }
    } catch (_err) {
      const error = _err as AxiosError
      dispatch(addErrorNotification(error))
      dispatch(getTriggeredFunctionsLibraryDetailsFailure())
      onFailAction?.()
    }
  }
}

export function replaceTriggeredFunctionsLibraryAction(
  instanceId: string,
  code: string,
  configuration: Nullable<string>,
  onSuccessAction?: () => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(replaceTriggeredFunctionsLibrary())

      const { status } = await apiService.post(
        getUrl(
          instanceId,
          ApiEndpoints.TRIGGERED_FUNCTIONS_REPLACE_LIBRARY,
        ),
        {
          code,
          configuration
        }
      )

      if (isStatusSuccessful(status)) {
        dispatch(replaceTriggeredFunctionsLibrarySuccess())
        onSuccessAction?.()
      }
    } catch (_err) {
      const error = _err as AxiosError
      dispatch(addErrorNotification(error))
      dispatch(replaceTriggeredFunctionsLibraryFailure())
      onFailAction?.()
    }
  }
}
