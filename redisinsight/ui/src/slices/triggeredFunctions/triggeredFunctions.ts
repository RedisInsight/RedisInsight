import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AxiosError } from 'axios'
import { remove } from 'lodash'
import successMessages from 'uiSrc/components/notifications/success-messages'
import {
  StateTriggeredFunctions,
  TriggeredFunctionsFunction,
  TriggeredFunctionsLibrary,
  TriggeredFunctionsLibraryDetails
} from 'uiSrc/slices/interfaces/triggeredFunctions'
import { AppDispatch, RootState } from 'uiSrc/slices/store'
import { apiService } from 'uiSrc/services'
import { getApiErrorMessage, getUrl, isStatusSuccessful, Nullable } from 'uiSrc/utils'
import { getLibraryName } from 'uiSrc/utils/triggered-functions/utils'
import { ApiEndpoints } from 'uiSrc/constants'
import { addMessageNotification, addErrorNotification } from 'uiSrc/slices/app/notifications'

export const initialState: StateTriggeredFunctions = {
  libraries: {
    data: null,
    loading: false,
    lastRefresh: null,
    error: '',
    selected: null,
    deleting: false,
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
  addLibrary: {
    open: false,
    loading: false,
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
    // delete library
    deleteTriggeredFunctionsLibrary: (state) => {
      state.libraries.deleting = true
    },
    deleteTriggeredFunctionsLibrarySuccess: (state, { payload }) => {
      state.libraries.deleting = false
      if (state.libraries.data) {
        remove(state.libraries.data, (library) => library.name === payload)
      }
    },
    deleteTriggeredFunctionsLibraryFailure: (state) => {
      state.libraries.deleting = false
    },
    setSelectedFunctionToShow: (state, { payload }: PayloadAction<Nullable<TriggeredFunctionsFunction>>) => {
      state.functions.selected = payload
    },
    setSelectedLibraryToShow: (state, { payload }: PayloadAction<Nullable<string>>) => {
      state.libraries.selected = payload
    },

    addTriggeredFunctionsLibrary: (state) => {
      state.addLibrary.loading = true
    },
    addTriggeredFunctionsLibrarySuccess: (state) => {
      state.addLibrary.loading = false
    },
    addTriggeredFunctionsLibraryFailure: (state) => {
      state.addLibrary.loading = false
    },
    setAddLibraryFormOpen: (state, { payload }: PayloadAction<boolean>) => {
      state.addLibrary.open = payload
    }
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
  deleteTriggeredFunctionsLibrary,
  deleteTriggeredFunctionsLibrarySuccess,
  deleteTriggeredFunctionsLibraryFailure,
  setSelectedFunctionToShow,
  setSelectedLibraryToShow,
  addTriggeredFunctionsLibrary,
  addTriggeredFunctionsLibrarySuccess,
  addTriggeredFunctionsLibraryFailure,
  setAddLibraryFormOpen,
} = triggeredFunctionsSlice.actions

export const triggeredFunctionsSelector = (state: RootState) => state.triggeredFunctions
export const triggeredFunctionsLibrariesSelector = (state: RootState) => state.triggeredFunctions.libraries
export const triggeredFunctionsFunctionsSelector = (state: RootState) => state.triggeredFunctions.functions
export const triggeredFunctionsSelectedLibrarySelector = (state: RootState) => state.triggeredFunctions.selectedLibrary
export const triggeredFunctionsAddLibrarySelector = (state: RootState) => state.triggeredFunctions.addLibrary

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

export function addTriggeredFunctionsLibraryAction(
  instanceId: string,
  code: string,
  configuration: Nullable<string>,
  onSuccessAction?: (name: string) => void,
  onFailAction?: (error: string) => void,
) {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(addTriggeredFunctionsLibrary())

      const { status } = await apiService.post(
        getUrl(
          instanceId,
          ApiEndpoints.TRIGGERED_FUNCTIONS_LIBRARY,
        ),
        {
          code,
          configuration
        }
      )

      if (isStatusSuccessful(status)) {
        const libraryName = getLibraryName(code)
        dispatch(addTriggeredFunctionsLibrarySuccess())
        dispatch(
          addMessageNotification(successMessages.ADD_LIBRARY(libraryName))
        )
        dispatch(fetchTriggeredFunctionsLibrariesList(instanceId))
        onSuccessAction?.(libraryName)
      }
    } catch (_err) {
      const error = _err as AxiosError
      dispatch(addErrorNotification(error))
      dispatch(addTriggeredFunctionsLibraryFailure())
      onFailAction?.(getApiErrorMessage(error))
    }
  }
}

export function deleteTriggeredFunctionsLibraryAction(
  instanceId: string,
  libraryName: string,
  onSuccessAction?: (library: string) => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(deleteTriggeredFunctionsLibrary())

      const { status } = await apiService.delete(
        getUrl(
          instanceId,
          ApiEndpoints.TRIGGERED_FUNCTIONS_LIBRARY,
        ),
        {
          data: { libraryName },
        }
      )

      if (isStatusSuccessful(status)) {
        dispatch(deleteTriggeredFunctionsLibrarySuccess(libraryName))
        dispatch(
          addMessageNotification(successMessages.DELETE_LIBRARY(libraryName))
        )
        onSuccessAction?.(libraryName)
      }
    } catch (_err) {
      const error = _err as AxiosError
      dispatch(addErrorNotification(error))
      dispatch(deleteTriggeredFunctionsLibraryFailure())
      onFailAction?.()
    }
  }
}
