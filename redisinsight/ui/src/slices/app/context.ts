import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RelativeWidthSizes } from 'uiSrc/components/virtual-table/interfaces'
import { ConfigDBStorageItem } from 'uiSrc/constants/storage'
import { Nullable } from 'uiSrc/utils'
import {
  BrowserStorageItem,
  DEFAULT_DELIMITER,
  DEFAULT_SLOWLOG_DURATION_UNIT,
  KeyTypes,
  DEFAULT_SHOW_HIDDEN_RECOMMENDATIONS,
  SortOrder,
  DEFAULT_TREE_SORTING,
} from 'uiSrc/constants'
import { localStorageService, setDBConfigStorageField } from 'uiSrc/services'
import { RootState } from '../store'
import { RedisResponseBuffer, StateAppContext } from '../interfaces'
import { SearchMode } from '../interfaces/keys'

export const initialState: StateAppContext = {
  contextInstanceId: '',
  lastPage: '',
  dbConfig: {
    treeViewDelimiter: DEFAULT_DELIMITER,
    treeViewSort: DEFAULT_TREE_SORTING,
    slowLogDurationUnit: DEFAULT_SLOWLOG_DURATION_UNIT,
    showHiddenRecommendations: DEFAULT_SHOW_HIDDEN_RECOMMENDATIONS,
  },
  dbIndex: {
    disabled: false
  },
  browser: {
    keyList: {
      isDataPatternLoaded: false,
      isDataRedisearchLoaded: false,
      scrollPatternTopPosition: 0,
      scrollRedisearchTopPosition: 0,
      isNotRendered: true,
      selectedKey: null,
    },
    panelSizes: {},
    tree: {
      delimiter: DEFAULT_DELIMITER,
      openNodes: {},
      selectedLeaf: null,
    },
    bulkActions: {
      opened: false,
    },
    keyDetailsSizes: {
      [KeyTypes.Hash]: localStorageService?.get(BrowserStorageItem.keyDetailSizes)?.hash ?? null,
      [KeyTypes.List]: localStorageService?.get(BrowserStorageItem.keyDetailSizes)?.list ?? null,
      [KeyTypes.ZSet]: localStorageService?.get(BrowserStorageItem.keyDetailSizes)?.zset ?? null,
    }
  },
  workbench: {
    script: '',
    panelSizes: {
      vertical: {}
    }
  },
  pubsub: {
    channel: '',
    message: ''
  },
  analytics: {
    lastViewedPage: ''
  },
  triggeredFunctions: {
    lastViewedPage: ''
  }
}

// A slice for recipes
const appContextSlice = createSlice({
  name: 'appContext',
  initialState,
  reducers: {
    // don't need to reset instanceId
    setAppContextInitialState: (state) => ({
      ...initialState,
      browser: {
        ...initialState.browser,
        keyDetailsSizes: state.browser.keyDetailsSizes
      },
      contextInstanceId: state.contextInstanceId
    }),
    // set connected instance
    setAppContextConnectedInstanceId: (state, { payload }: { payload: string }) => {
      state.contextInstanceId = payload
    },
    setDbConfig: (state, { payload }) => {
      state.dbConfig.treeViewDelimiter = payload?.treeViewDelimiter ?? DEFAULT_DELIMITER
      state.dbConfig.treeViewSort = payload?.treeViewSort ?? DEFAULT_TREE_SORTING
      state.dbConfig.slowLogDurationUnit = payload?.slowLogDurationUnit ?? DEFAULT_SLOWLOG_DURATION_UNIT
      state.dbConfig.showHiddenRecommendations = payload?.showHiddenRecommendations
        ?? DEFAULT_SHOW_HIDDEN_RECOMMENDATIONS
    },
    setSlowLogUnits: (state, { payload }) => {
      state.dbConfig.slowLogDurationUnit = payload
      setDBConfigStorageField(state.contextInstanceId, ConfigDBStorageItem.slowLogDurationUnit, payload)
    },
    setBrowserTreeDelimiter: (state, { payload }: { payload: string }) => {
      state.dbConfig.treeViewDelimiter = payload
      setDBConfigStorageField(state.contextInstanceId, BrowserStorageItem.treeViewDelimiter, payload)
    },
    setBrowserTreeSort: (state, { payload }: PayloadAction<SortOrder>) => {
      state.dbConfig.treeViewSort = payload
      setDBConfigStorageField(state.contextInstanceId, BrowserStorageItem.treeViewSort, payload)
    },
    setRecommendationsShowHidden: (state, { payload }: { payload: boolean }) => {
      state.dbConfig.showHiddenRecommendations = payload
      setDBConfigStorageField(state.contextInstanceId, BrowserStorageItem.showHiddenRecommendations, payload)
    },
    setBrowserSelectedKey: (state, { payload }: { payload: Nullable<RedisResponseBuffer> }) => {
      state.browser.keyList.selectedKey = payload
    },
    setBrowserPatternKeyListDataLoaded: (state, { payload }: { payload: boolean }) => {
      state.browser.keyList.isDataPatternLoaded = payload
    },
    setBrowserRedisearchKeyListDataLoaded: (state, { payload }: { payload: boolean }) => {
      state.browser.keyList.isDataRedisearchLoaded = payload
    },
    setBrowserPatternScrollPosition: (state, { payload }: { payload: number }) => {
      state.browser.keyList.scrollPatternTopPosition = payload
    },
    setBrowserRedisearchScrollPosition: (state, { payload }: { payload: number }) => {
      state.browser.keyList.scrollRedisearchTopPosition = payload
    },
    setBrowserIsNotRendered: (state, { payload }: { payload: boolean }) => {
      state.browser.keyList.isNotRendered = payload
    },
    clearBrowserKeyListData: (state) => {
      state.browser.keyList = {
        ...initialState.browser.keyList,
        selectedKey: state.browser.keyList.selectedKey
      }
    },
    setBrowserPanelSizes: (state, { payload }: { payload: any }) => {
      state.browser.panelSizes = payload
    },
    setBrowserTreeNodesOpen: (state, { payload }: { payload: { [key: string]: boolean; } }) => {
      state.browser.tree.openNodes = payload
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
    resetBrowserTree: (state) => {
      state.browser.tree.selectedLeaf = null
      state.browser.tree.openNodes = {}
    },
    setPubSubFieldsContext: (state, { payload }: { payload: { channel: string, message: string } }) => {
      state.pubsub.channel = payload.channel
      state.pubsub.message = payload.message
    },
    setBrowserBulkActionOpen: (state, { payload }: PayloadAction<boolean>) => {
      state.browser.bulkActions.opened = payload
    },
    setLastAnalyticsPage: (state, { payload }: { payload: string }) => {
      state.analytics.lastViewedPage = payload
    },
    updateKeyDetailsSizes: (
      state,
      { payload }: { payload: { type: KeyTypes, sizes: RelativeWidthSizes } }
    ) => {
      const { type, sizes } = payload
      state.browser.keyDetailsSizes[type] = sizes
      localStorageService?.set(BrowserStorageItem.keyDetailSizes, state.browser.keyDetailsSizes)
    },
    setDbIndexState: (state, { payload }: { payload: boolean }) => {
      state.dbIndex.disabled = payload
    },
    setLastTriggeredFunctionsPage: (state, { payload }: { payload: string }) => {
      state.triggeredFunctions.lastViewedPage = payload
    },
  },
})

// Actions generated from the slice
export const {
  setAppContextInitialState,
  setAppContextConnectedInstanceId,
  setDbConfig,
  setSlowLogUnits,
  setBrowserPatternKeyListDataLoaded,
  setBrowserRedisearchKeyListDataLoaded,
  setBrowserSelectedKey,
  setBrowserPatternScrollPosition,
  setBrowserRedisearchScrollPosition,
  setBrowserIsNotRendered,
  setBrowserPanelSizes,
  setBrowserTreeNodesOpen,
  setBrowserTreeDelimiter,
  resetBrowserTree,
  setWorkbenchScript,
  setWorkbenchVerticalPanelSizes,
  setLastPageContext,
  setPubSubFieldsContext,
  setBrowserBulkActionOpen,
  setLastAnalyticsPage,
  updateKeyDetailsSizes,
  clearBrowserKeyListData,
  setDbIndexState,
  setRecommendationsShowHidden,
  setLastTriggeredFunctionsPage,
  setBrowserTreeSort,
} = appContextSlice.actions

// Selectors
export const appContextSelector = (state: RootState) =>
  state.app.context
export const appContextDbConfig = (state: RootState) =>
  state.app.context.dbConfig
export const appContextBrowser = (state: RootState) =>
  state.app.context.browser
export const appContextBrowserTree = (state: RootState) =>
  state.app.context.browser.tree
export const appContextBrowserKeyDetails = (state: RootState) =>
  state.app.context.browser.keyDetailsSizes
export const appContextWorkbench = (state: RootState) =>
  state.app.context.workbench
export const appContextSelectedKey = (state: RootState) =>
  state.app.context.browser.keyList.selectedKey
export const appContextPubSub = (state: RootState) =>
  state.app.context.pubsub
export const appContextAnalytics = (state: RootState) =>
  state.app.context.analytics
export const appContextDbIndex = (state: RootState) =>
  state.app.context.dbIndex
export const appContextTriggeredFunctions = (state: RootState) =>
  state.app.context.triggeredFunctions

// The reducer
export default appContextSlice.reducer

// Asynchronous thunk action
export function setBrowserKeyListDataLoaded(
  searchMode: SearchMode,
  value: boolean,
) {
  return searchMode === SearchMode.Pattern
    ? setBrowserPatternKeyListDataLoaded(value)
    : setBrowserRedisearchKeyListDataLoaded(value)
}
