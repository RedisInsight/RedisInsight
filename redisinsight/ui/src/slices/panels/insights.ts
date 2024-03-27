import { createSlice } from '@reduxjs/toolkit'

import { isBoolean } from 'lodash'
import { useHistory } from 'react-router-dom'
import { Maybe } from 'uiSrc/utils'
import { InsightsPanelState, InsightsPanelTabs } from 'uiSrc/slices/interfaces/insights'
import { sessionStorageService } from 'uiSrc/services'
import { BrowserStorageItem, EAManifestFirstKey } from 'uiSrc/constants'
import { AppDispatch, RootState } from '../store'

const getTabSelected = (tab?: string): InsightsPanelTabs => {
  if (Object.values(InsightsPanelTabs).includes(tab as unknown as InsightsPanelTabs)) {
    return tab as InsightsPanelTabs
  }

  return InsightsPanelTabs.Explore
}

export const initialState: InsightsPanelState = {
  isOpen: sessionStorageService.get(BrowserStorageItem.insightsPanel)?.[1] || false,
  tabSelected: getTabSelected(sessionStorageService.get(BrowserStorageItem.insightsPanel)?.[0]),
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
  name: 'insightsPanel',
  initialState,
  reducers: {
    toggleInsightsPanel: (state, { payload }: { payload: Maybe<boolean> }) => {
      state.isOpen = isBoolean(payload) ? payload : !state.isOpen
      sessionStorageService.set(BrowserStorageItem.insightsPanel, [state.tabSelected, state.isOpen])
    },
    changeSelectedTab: (state, { payload }) => {
      state.tabSelected = payload
      sessionStorageService.set(BrowserStorageItem.insightsPanel, [payload, state.isOpen])
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

export function openTutorialByPath(path: string, history: ReturnType<typeof useHistory>) {
  return async (dispatch: AppDispatch) => {
    dispatch(changeSelectedTab(InsightsPanelTabs.Explore))
    dispatch(toggleInsightsPanel(true))

    if (path) {
      history.push({
        search: `path=${EAManifestFirstKey.TUTORIALS}/${path}`
      })
    }
  }
}

// The reducer
export default insightsPanelSlice.reducer
