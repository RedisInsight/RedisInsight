import { createSlice } from '@reduxjs/toolkit'
import { remove } from 'lodash'
import { BrowserStorageItem } from 'uiSrc/constants'
import { BUILD_FEATURES } from 'uiSrc/constants/featuresHighlighting'
import { localStorageService } from 'uiSrc/services'
import { StateAppFeaturesHighlighting } from 'uiSrc/slices/interfaces'
import { RootState } from 'uiSrc/slices/store'
import { getPagesForFeatures } from 'uiSrc/utils/highlighting'

export const initialState: StateAppFeaturesHighlighting = {
  version: '',
  features: [],
  pages: {}
}

const appFeaturesHighlightingSlice = createSlice({
  name: 'appFeaturesHighlighting',
  initialState,
  reducers: {
    setFeaturesInitialState: () => initialState,
    setFeaturesToHighlight: (state, { payload }: { payload: { version: string, features: string[] } }) => {
      state.features = payload.features
      state.version = payload.version
      state.pages = getPagesForFeatures(payload.features)
    },
    removeFeatureFromHighlighting: (state, { payload }: { payload: string }) => {
      remove(state.features, (f) => f === payload)

      const pageName = BUILD_FEATURES[payload].page
      if (pageName && pageName in state.pages) {
        remove(state.pages[pageName], (f) => f === payload)
      }

      const { version, features } = state
      localStorageService.set(BrowserStorageItem.featuresHighlighting, { version, features })
    }
  }
})

export const {
  setFeaturesInitialState,
  setFeaturesToHighlight,
  removeFeatureFromHighlighting
} = appFeaturesHighlightingSlice.actions

export const appFeatureHighlightingSelector = (state: RootState) => state.app.featuresHighlighting
export const appFeaturesToHighlightSelector = (state: RootState): { [key: string]: boolean } =>
  state.app.featuresHighlighting.features
    .reduce((prev, next) => ({ ...prev, [next]: true }), {})
export const appFeaturePagesHighlightingSelector = (state: RootState) => state.app.featuresHighlighting.pages

export default appFeaturesHighlightingSlice.reducer
