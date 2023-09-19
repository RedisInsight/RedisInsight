import { createSlice } from '@reduxjs/toolkit'
import { RootState } from 'uiSrc/slices/store'
import { StateUrlHandling } from 'uiSrc/slices/interfaces/urlHandling'

export const initialState: StateUrlHandling = {
  fromUrl: null,
  action: null,
  dbConnection: null,
  properties: {}
}

const appUrlHandlingSlice = createSlice({
  name: 'appUrlHandling',
  initialState,
  reducers: {
    setUrlHandlingInitialState: () => initialState,
    setFromUrl: (state, { payload }) => {
      state.fromUrl = payload
    },
    setUrlDbConnection: (state, { payload }) => {
      state.action = payload.action
      state.dbConnection = payload.dbConnection
    },
    setUrlProperties: (state, { payload }) => {
      state.properties = payload
    }
  }
})

export const {
  setUrlHandlingInitialState,
  setFromUrl,
  setUrlDbConnection,
  setUrlProperties,
} = appUrlHandlingSlice.actions

export const appRedirectionSelector = (state: RootState) => state.app.urlHandling

export default appUrlHandlingSlice.reducer
