import { createSlice } from '@reduxjs/toolkit'
import { AxiosError } from 'axios'
import { ApiEndpoints } from 'uiSrc/constants'
import { getApiErrorMessage, isStatusSuccessful } from 'uiSrc/utils'
import { apiService } from 'uiSrc/services'
import { DatabaseSettings, DatabaseSettingsData } from '../interfaces'
import { AppDispatch, RootState } from '../store'

export const initialState: DatabaseSettings = {
  loading: false,
  error: '',
  data: {}
}

// A slice for recipes
const appDbSettingsSlice = createSlice({
  name: 'appDbSettings',
  initialState,
  reducers: {
    getDBSettings: (state) => {
      state.loading = true
    },
    getDBSettingsSuccess: (state, { payload: {
      data,
      id
    } }: { payload: {
      id: string,
      data: DatabaseSettingsData
    } }) => {
      state.loading = false
      state.data = { ...state.data, [id]: data }
    },
    getDBSettingsFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
  },
})

// Actions generated from the slice
export const {
  getDBSettings,
  getDBSettingsSuccess,
  getDBSettingsFailure,
} = appDbSettingsSlice.actions

// A selector
export const appDBSettingsSelector = (state: RootState) => state.app.dbSettings

// The reducer
export default appDbSettingsSlice.reducer

// Asynchronous thunk action
export function fetchDBSettings(onSuccessAction?: () => void, onFailAction?: () => void) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(getDBSettings())

    const state = stateInit()
    const { id } = state.connections.instances.connectedInstance

    if (!id) {
      getDBSettingsFailure('DB not connected')
      return
    }
    const url = `${ApiEndpoints.DATABASES}/${id}/settings`
    try {
      const { data: { data }, status } = await apiService.get<{ data:Record<string, any> }>(url)
      if (isStatusSuccessful(status)) {
        getDBSettingsSuccess({ id, data })
        onSuccessAction?.()
      } else {
        getDBSettingsFailure(data)
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error as AxiosError)
      dispatch(getDBSettingsFailure(errorMessage))
      onFailAction?.()
    }
  }
}
