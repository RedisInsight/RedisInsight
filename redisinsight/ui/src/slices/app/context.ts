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
    panelSizes: {},
    tree: {
      panelSizes: {},
      openNodes: {},
      selectedLeaf: {},
    }
  },
  workbench: {
    script: '',
    enablementArea: {
      ItemPath: '',
      ItemScrollTop: 0,
    },
    panelSizes: {
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
    setBrowserTreeSelectedLeaf: (state, { payload }: { payload: any }) => {
      state.browser.tree.selectedLeaf = payload
    },
    setBrowserTreeNodesOpen: (state, { payload }: { payload: { [key: string]: boolean; } }) => {
      state.browser.tree.openNodes = payload
    },
    setBrowserTreePanelSizes: (state, { payload }: { payload: any }) => {
      state.browser.tree.panelSizes = payload
    },
    setWorkbenchScript: (state, { payload }: { payload: string }) => {
      state.workbench.script = payload
    },
    setWorkbenchVerticalPanelSizes: (state, { payload }: { payload: any }) => {
      state.workbench.panelSizes.vertical = payload
    },
    setLastPageContext: (state, { payload }: { payload: string }) => {
      state.lastPage = payload
    },
    setWorkbenchEAItem: (state, { payload }: { payload: any }) => {
      const prevValue = state.workbench.enablementArea.ItemPath
      state.workbench.enablementArea.ItemPath = payload
      if (prevValue !== payload) {
        state.workbench.enablementArea.ItemScrollTop = 0
      }
    },
    setWorkbenchEAItemScrollTop: (state, { payload }: { payload: any }) => {
      state.workbench.enablementArea.ItemScrollTop = payload || 0
    },
    resetWorkbenchEAItem: (state) => {
      state.workbench.enablementArea.ItemPath = ''
      state.workbench.enablementArea.ItemScrollTop = 0
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
  setBrowserTreeSelectedLeaf,
  setBrowserTreeNodesOpen,
  setBrowserTreePanelSizes,
  setWorkbenchScript,
  setWorkbenchVerticalPanelSizes,
  setLastPageContext,
  setWorkbenchEAItem,
  resetWorkbenchEAItem,
  setWorkbenchEAItemScrollTop,
} = appContextSlice.actions

// Selectors
export const appContextSelector = (state: RootState) =>
  state.app.context
export const appContextBrowser = (state: RootState) =>
  state.app.context.browser
export const appContextBrowserTree = (state: RootState) =>
  state.app.context.browser.tree
export const appContextWorkbench = (state: RootState) =>
  state.app.context.workbench
export const appContextSelectedKey = (state: RootState) =>
  state.app.context.browser.keyList.selectedKey
export const appContextWorkbenchEA = (state: RootState) =>
  state.app.context.workbench.enablementArea

// The reducer
export default appContextSlice.reducer
