import { cloneDeep } from 'lodash'
import reducer, {
  initialState,
  setFeaturesInitialState,
  appFeatureHighlightingSelector,
  setFeaturesToHighlight,
  removeFeatureFromHighlighting
} from 'uiSrc/slices/app/features-highlighting'
import {
  cleanup,
  initialStateDefault,
  MOCKED_HIGHLIGHTING_FEATURES,
  mockedStore
} from 'uiSrc/utils/test-utils'

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

const mockFeatures = MOCKED_HIGHLIGHTING_FEATURES
describe('slices', () => {
  describe('setFeaturesInitialState', () => {
    it('should properly set initial state', () => {
      const nextState = reducer(initialState, setFeaturesInitialState())
      const rootState = Object.assign(initialStateDefault, {
        app: { featuresHighlighting: nextState },
      })
      expect(appFeatureHighlightingSelector(rootState)).toEqual(initialState)
    })
  })

  describe('setFeaturesToHighlight', () => {
    it('should properly set features to highlight', () => {
      const payload = {
        features: mockFeatures,
        version: '2.0.0'
      }
      const state = {
        ...initialState,
        features: payload.features,
        version: payload.version,
        pages: {
          browser: payload.features
        }
      }

      // Act
      const nextState = reducer(initialState, setFeaturesToHighlight(payload))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { featuresHighlighting: nextState },
      })

      expect(appFeatureHighlightingSelector(rootState)).toEqual(state)
    })
  })

  describe('removeFeatureFromHighlighting', () => {
    it('should properly remove feature to highlight', () => {
      const prevState = {
        ...initialState,
        features: mockFeatures,
        version: '2.0.0',
        pages: {
          browser: mockFeatures
        }
      }

      const payload = mockFeatures[0]
      const state = {
        ...prevState,
        features: [mockFeatures[1]],
        pages: {
          browser: [mockFeatures[1]]
        }
      }

      // Act
      const nextState = reducer(prevState, removeFeatureFromHighlighting(payload))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { featuresHighlighting: nextState },
      })

      expect(appFeatureHighlightingSelector(rootState)).toEqual(state)
    })
  })
})
