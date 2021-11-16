import { createSlice } from '@reduxjs/toolkit'
import { Nullable } from 'uiSrc/utils'
import { RootState } from '../store'
import { StateAppContext } from '../interfaces'

export const initialState: StateAppContext = {
  contextInstanceId: '',
  lastPage: '',
  browser: {
    keyList: {
      isDataLoaded: false,
      scrollTopPosition: 0,
      selectedKey: null
    },
    panelSizes: {}
  },
  workbench: {
    script: '',
    panelSizes: {
      horizontal: {},
      vertical: {}
    }
  }
}

// A slice for recipes
const appContextSlice = createSlice({
  name: 'appContext',
  initialState,
  reducers: {
    setAppContextInitialState: () => initialState,
    // set connected instance
    setAppContextConnectedInstanceId: (state, { payload }: { payload: string }) => {
      state.contextInstanceId = payload
    },
    setBrowserSelectedKey: (state, { payload }: { payload: Nullable<string> }) => {
      state.browser.keyList.selectedKey = payload
    },
    setBrowserKeyListDataLoaded: (state, { payload }: { payload: boolean }) => {
      state.browser.keyList.isDataLoaded = payload
    },
    setBrowserKeyListScrollPosition: (state, { payload }: { payload: number }) => {
      state.browser.keyList.scrollTopPosition = payload
    },
    setBrowserPanelSizes: (state, { payload }: { payload: any }) => {
      state.browser.panelSizes = payload
    },
    setWorkbenchScript: (state, { payload }: { payload: string }) => {
      state.workbench.script = payload
    },
    setWorkbenchHorizontalPanelSizes: (state, { payload }: { payload: any }) => {
      state.workbench.panelSizes.horizontal = payload
    },
    setWorkbenchVerticalPanelSizes: (state, { payload }: { payload: any }) => {
      state.workbench.panelSizes.vertical = payload
    },
    setLastPageContext: (state, { payload }: { payload: string }) => {
      state.lastPage = payload
    },
  },
})

// Actions generated from the slice
export const {
  setAppContextInitialState,
  setAppContextConnectedInstanceId,
  setBrowserKeyListDataLoaded,
  setBrowserSelectedKey,
  setBrowserKeyListScrollPosition,
  setBrowserPanelSizes,
  setWorkbenchScript,
  setWorkbenchHorizontalPanelSizes,
  setWorkbenchVerticalPanelSizes,
  setLastPageContext
} = appContextSlice.actions

// Selectors
export const appContextSelector = (state: RootState) =>
  state.app.context
export const appContextBrowser = (state: RootState) =>
  state.app.context.browser
export const appContextWorkbench = (state: RootState) =>
  state.app.context.workbench
export const appContextSelectedKey = (state: RootState) =>
  state.app.context.browser.keyList.selectedKey

// The reducer
export default appContextSlice.reducer
