import { cloneDeep } from 'lodash'

import {
  cleanup,
  initialStateDefault,
  mockedStore,
} from 'uiSrc/utils/test-utils'

import { apiService } from 'uiSrc/services'
import { mswServer } from 'uiSrc/mocks/server'
import { errorHandlers } from 'uiSrc/mocks/res/responseComposition'
import { DEFAULT_ERROR_MESSAGE } from 'uiSrc/utils'
import { APP_INFO_DATA_MOCK } from 'uiSrc/mocks/handlers/app/infoHandlers'
import reducer, {
  initialState,
  setAnalyticsIdentified,
  setElectronInfo,
  setReleaseNotesViewed,
  getServerInfo,
  getServerInfoSuccess,
  getServerInfoFailure,
  appInfoSelector, fetchServerInfo,
} from '../../app/info'

jest.mock('uiSrc/services')

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

/**
 * slices tests
 *
 * @group unit
 */
describe('slices', () => {
/**
 * reducer, actions and selectors tests
 *
 * @group unit
 */
  describe('reducer, actions and selectors', () => {
    it('should return the initial state on first run', () => {
      // Arrange
      const nextState = initialState

      // Act
      const result = reducer(undefined, {})

      // Assert
      expect(result).toEqual(nextState)
    })
  })

  /**
 * setAnalyticsIdentified tests
 *
 * @group unit
 */
  describe('setAnalyticsIdentified', () => {
    it('should properly set analytics identified', () => {
      // Arrange
      const identified = true
      const state = {
        ...initialState,
        analytics: {
          ...initialState.analytics,
          identified
        }
      }

      // Act
      const nextState = reducer(initialState, setAnalyticsIdentified(identified))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { info: nextState },
      })

      expect(appInfoSelector(rootState)).toEqual(state)
    })
  })

  /**
 * setElectronInfo tests
 *
 * @group unit
 */
  describe('setElectronInfo', () => {
    it('should properly set electron info', () => {
      // Arrange
      const data = {
        isUpdateAvailable: true,
        updateDownloadedVersion: '1.2.0'
      }
      const state = {
        ...initialState,
        electron: {
          ...initialState.electron,
          ...data
        }
      }

      // Act
      const nextState = reducer(initialState, setElectronInfo(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { info: nextState },
      })

      expect(appInfoSelector(rootState)).toEqual(state)
    })
  })

  /**
 * setReleaseNotesViewed tests
 *
 * @group unit
 */
  describe('setReleaseNotesViewed', () => {
    it('should properly set state', () => {
      // Arrange
      const isReleaseNotesViewed = true
      const state = {
        ...initialState,
        electron: {
          ...initialState.electron,
          isReleaseNotesViewed
        }
      }

      // Act
      const nextState = reducer(initialState, setReleaseNotesViewed(isReleaseNotesViewed))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { info: nextState },
      })

      expect(appInfoSelector(rootState)).toEqual(state)
    })
  })

  /**
 * getServerInfo tests
 *
 * @group unit
 */
  describe('getServerInfo', () => {
    it('should properly set loading', () => {
      // Arrange
      const loading = true
      const state = {
        ...initialState,
        loading
      }

      // Act
      const nextState = reducer(initialState, getServerInfo())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { info: nextState },
      })

      expect(appInfoSelector(rootState)).toEqual(state)
    })
  })

  /**
 * getServerInfoSuccess tests
 *
 * @group unit
 */
  describe('getServerInfoSuccess', () => {
    it('should properly set state after success', () => {
      const state = {
        ...initialState,
        loading: false,
        server: APP_INFO_DATA_MOCK
      }

      // Act
      const nextState = reducer(initialState, getServerInfoSuccess(APP_INFO_DATA_MOCK))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { info: nextState },
      })

      expect(appInfoSelector(rootState)).toEqual(state)
    })
  })

  /**
 * getServerInfoFailure tests
 *
 * @group unit
 */
  describe('getServerInfoFailure', () => {
    it('should properly set error', () => {
      // Arrange
      const error = 'error'
      const state = {
        ...initialState,
        loading: false,
        error
      }

      // Act
      const nextState = reducer(initialState, getServerInfoFailure(error))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { info: nextState },
      })

      expect(appInfoSelector(rootState)).toEqual(state)
    })
  })

  // thunks
  /**
 * fetchServerInfo tests
 *
 * @group unit
 */
  describe('fetchServerInfo', () => {
    it('succeed to fetch server info', async () => {
      // Act
      await store.dispatch<any>(fetchServerInfo(jest.fn()))

      // Assert
      const expectedActions = [
        getServerInfo(),
        getServerInfoSuccess(APP_INFO_DATA_MOCK),
      ]

      expect(mockedStore.getActions()).toEqual(expectedActions)
    })

    it('failed to fetch server info', async () => {
      mswServer.use(...errorHandlers)

      // Act
      await store.dispatch<any>(fetchServerInfo(jest.fn(), jest.fn()))

      // Assert
      const expectedActions = [
        getServerInfo(),
        getServerInfoFailure(DEFAULT_ERROR_MESSAGE),
      ]

      expect(mockedStore.getActions()).toEqual(expectedActions)
    })
  })
})
