import { createSlice } from '@reduxjs/toolkit'

import { isBoolean } from 'lodash'
import { Maybe } from 'uiSrc/utils'
import { InsightsPanelState, InsightsPanelTabs } from 'uiSrc/slices/interfaces/insights'
import { RootState } from '../store'

export const initialState: InsightsPanelState = {
  isOpen: false,
  tabSelected: InsightsPanelTabs.Explore,
  explore: {
    search: '',
    itemScrollTop: 0,
    data: null,
    url: null,
    manifest: null,
    isPageOpen: false
  }
}

// A slice for recipes
const insightsPanelSlice = createSlice({
  name: 'workbenchTutorials',
  initialState,
  reducers: {
    toggleInsightsPanel: (state, { payload }: { payload: Maybe<boolean> }) => {
      state.isOpen = isBoolean(payload) ? payload : !state.isOpen
    },
    changeSelectedTab: (state, { payload }) => {
      state.tabSelected = payload
    },
    setExplorePanelSearch: (state, { payload }: { payload: string }) => {
      const prevValue = state.explore.search
      state.explore.search = payload
      if (prevValue !== payload) {
        state.explore.itemScrollTop = 0
      }
    },
    setExplorePanelScrollTop: (state, { payload }: { payload: number }) => {
      state.explore.itemScrollTop = payload || 0
    },
    resetExplorePanelSearch: (state) => {
      state.explore.search = ''
      state.explore.itemScrollTop = 0
    },
    setExplorePanelContent: (state, { payload }) => {
      state.explore.data = payload.data
      state.explore.url = payload.url
    },
    setExplorePanelIsPageOpen: (state, { payload }) => {
      state.explore.isPageOpen = payload
    },
    setExplorePanelManifest: (state, { payload }) => {
      state.explore.manifest = payload
    }
  }
})

// A selector
export const insightsPanelSelector = (state: RootState) => state.panels.insights
export const explorePanelSelector = (state: RootState) => state.panels.insights.explore

// Actions generated from the slice
export const {
  toggleInsightsPanel,
  changeSelectedTab,
  setExplorePanelContent,
  setExplorePanelSearch,
  setExplorePanelScrollTop,
  resetExplorePanelSearch,
  setExplorePanelIsPageOpen,
  setExplorePanelManifest,
} = insightsPanelSlice.actions

// The reducer
export default insightsPanelSlice.reducer
