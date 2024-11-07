import { cloneDeep } from 'lodash'
import reducer, {
  appInitSelector,
  FAILED_TO_FETCH_CSRF_TOKEN_ERROR,
  initializeAppAction,
  initializeAppState,
  initializeAppStateFail,
  initializeAppStateSuccess,
  initialState,
  STATUS_FAIL,
  STATUS_LOADING,
  STATUS_SUCCESS,
} from 'uiSrc/slices/app/init'
import { cleanup, initialStateDefault, mockedStore } from 'uiSrc/utils/test-utils'
import { apiService } from 'uiSrc/services'
import { getFeatureFlags, getFeatureFlagsFailure, getFeatureFlagsSuccess } from 'uiSrc/slices/app/features'

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('init slice', () => {
  describe('initializeAppState', () => {
    it('should properly initialize app state', () => {
      const state = {
        ...initialState,
        status: STATUS_LOADING
      }

      // Act
      const nextState = reducer(initialState, initializeAppState())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { init: nextState },
      })

      expect(appInitSelector(rootState)).toEqual(state)
    })
  })

  describe('initializeAppStateSuccess', () => {
    it('should have success state', () => {
      const state = {
        ...initialState,
        status: STATUS_SUCCESS
      }

      // Act
      const nextState = reducer(initialState, initializeAppStateSuccess())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { init: nextState },
      })

      expect(appInitSelector(rootState)).toEqual(state)
    })
  })

  describe('initializeAppStateFail', () => {
    it('should have fail state', () => {
      const state = {
        ...initialState,
        status: STATUS_FAIL,
        error: FAILED_TO_FETCH_CSRF_TOKEN_ERROR
      }

      // Act
      const nextState = reducer(initialState, initializeAppStateFail({
        error: FAILED_TO_FETCH_CSRF_TOKEN_ERROR
      }))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { init: nextState },
      })

      expect(appInitSelector(rootState)).toEqual(state)
    })
  })

  describe('initApp', () => {
    it('succeed to init data', async () => {
      // Arrange
      const data = { features: { insightsRecommendations: true } }
      const responsePayload = { data, status: 200 }

      apiService.get = jest.fn().mockResolvedValue(responsePayload)

      // Act
      await store.dispatch<any>(initializeAppAction())

      // Assert
      const expectedActions = [
        initializeAppState(),
        getFeatureFlags(),
        getFeatureFlagsSuccess(data),
        initializeAppStateSuccess(),
      ]

      expect(store.getActions()).toEqual(expectedActions)
    })

    it('failed to init data', async () => {
      const responsePayload = {
        response: {
          status: 500,
          data: { message: FAILED_TO_FETCH_CSRF_TOKEN_ERROR },
        },
      }

      apiService.get = jest.fn().mockRejectedValue(responsePayload)

      // Act
      await store.dispatch<any>(initializeAppAction())

      // Assert
      const expectedActions = [
        initializeAppState(),
        getFeatureFlags(),
        getFeatureFlagsFailure(),
        initializeAppStateFail({ error: FAILED_TO_FETCH_CSRF_TOKEN_ERROR }),
      ]

      expect(store.getActions()).toEqual(expectedActions)
    })
  })
})
