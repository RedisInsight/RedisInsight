import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AxiosError } from 'axios'
import {
  StateTriggeredFunctions,
  TriggeredFunctionsFunction,
  TriggeredFunctionsLibrary,
  TriggeredFunctionsLibraryDetails
} from 'uiSrc/slices/interfaces/triggeredFunctions'
import { AppDispatch, RootState } from 'uiSrc/slices/store'
import { apiService } from 'uiSrc/services'
import { getApiErrorMessage, getUrl, isStatusSuccessful, Nullable } from 'uiSrc/utils'
import { ApiEndpoints } from 'uiSrc/constants'
import { addErrorNotification } from 'uiSrc/slices/app/notifications'

export const initialState: StateTriggeredFunctions = {
  libraries: {
    data: null,
    loading: false,
    lastRefresh: null,
    error: '',
    selected: null,
  },
  functions: {
    data: null,
    loading: false,
    lastRefresh: null,
    error: '',
    selected: null
  },
  selectedLibrary: {
    lastRefresh: null,
    loading: false,
    data: null
  },
}

const triggeredFunctionsSlice = createSlice({
  name: 'triggeredFunctions',
  initialState,
  reducers: {
    setTriggeredFunctionsInitialState: () => initialState,
    getTriggeredFunctionsLibrariesList: (state) => {
      state.libraries.loading = true
      state.libraries.error = ''
    },
    getTriggeredFunctionsLibrariesListSuccess: (state, { payload }) => {
      state.libraries.loading = false
      state.libraries.lastRefresh = Date.now()
      state.libraries.data = payload
    },
    getTriggeredFunctionsLibrariesListFailure: (state, { payload }) => {
      state.libraries.loading = false
      state.libraries.error = payload
    },
    getTriggeredFunctionsFunctionsList: (state) => {
      state.functions.loading = true
      state.functions.error = ''
    },
    getTriggeredFunctionsFunctionsListSuccess: (state, { payload }) => {
      state.functions.loading = false
      state.functions.lastRefresh = Date.now()
      state.functions.data = payload
    },
    getTriggeredFunctionsFunctionsListFailure: (state, { payload }) => {
      state.functions.loading = false
      state.functions.error = payload
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
    },
    setSelectedFunctionToShow: (state, { payload }: PayloadAction<Nullable<TriggeredFunctionsFunction>>) => {
      state.functions.selected = payload
    },
    setSelectedLibraryToShow: (state, { payload }: PayloadAction<Nullable<string>>) => {
      state.libraries.selected = payload
    },
  }
})

export const {
  setTriggeredFunctionsInitialState,
  getTriggeredFunctionsLibrariesList,
  getTriggeredFunctionsLibrariesListSuccess,
  getTriggeredFunctionsFunctionsList,
  getTriggeredFunctionsFunctionsListSuccess,
  getTriggeredFunctionsFunctionsListFailure,
  getTriggeredFunctionsLibrariesListFailure,
  setTriggeredFunctionsSelectedLibrary,
  getTriggeredFunctionsLibraryDetails,
  getTriggeredFunctionsLibraryDetailsSuccess,
  getTriggeredFunctionsLibraryDetailsFailure,
  replaceTriggeredFunctionsLibrary,
  replaceTriggeredFunctionsLibrarySuccess,
  replaceTriggeredFunctionsLibraryFailure,
  setSelectedFunctionToShow,
  setSelectedLibraryToShow,
} = triggeredFunctionsSlice.actions

export const triggeredFunctionsSelector = (state: RootState) => state.triggeredFunctions
export const triggeredFunctionsLibrariesSelector = (state: RootState) => state.triggeredFunctions.libraries
export const triggeredFunctionsFunctionsSelector = (state: RootState) => state.triggeredFunctions.functions
export const triggeredFunctionsSelectedLibrarySelector = (state: RootState) => state.triggeredFunctions.selectedLibrary

export default triggeredFunctionsSlice.reducer

// Asynchronous thunk action
export function fetchTriggeredFunctionsLibrariesList(
  instanceId: string,
  onSuccessAction?: (data: TriggeredFunctionsLibrary[]) => void,
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
        onSuccessAction?.(data)
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

export function fetchTriggeredFunctionsFunctionsList(
  instanceId: string,
  onSuccessAction?: (data: TriggeredFunctionsFunction[]) => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(getTriggeredFunctionsFunctionsList())

      const { data, status } = await apiService.get(
        getUrl(
          instanceId,
          ApiEndpoints.TRIGGERED_FUNCTIONS_FUNCTIONS,
        )
      )

      if (isStatusSuccessful(status)) {
        dispatch(getTriggeredFunctionsFunctionsListSuccess(data))
        onSuccessAction?.(data)
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(getTriggeredFunctionsFunctionsListFailure(errorMessage))
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
