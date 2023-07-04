import { cloneDeep } from 'lodash'
import { AxiosError } from 'axios'

import { cleanup, initialStateDefault, mockedStore } from 'uiSrc/utils/test-utils'
import { SignInDialogSource } from 'uiSrc/slices/interfaces'
import { apiService } from 'uiSrc/services'
import { addErrorNotification } from 'uiSrc/slices/app/notifications'
import reducer, {
  initialState,
  setSignInDialogState,
  oauthCloudSignInDialogSelector,
  signIn,
  signInSuccess,
  oauthCloudSelector,
  signInFailure,
  getAccountInfo,
  getAccountInfoSuccess,
  getAccountInfoFailure,
  fetchAccountInfo,
} from '../../oauth/cloud'

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('oauth cloud slice', () => {
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

  describe('signIn', () => {
    it('should properly set loading = true', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
      }

      // Act
      const nextState = reducer(initialState, signIn())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        oauth: {
          cloud: nextState
        }
      })
      expect(oauthCloudSelector(rootState)).toEqual(state)
    })
  })

  describe('signInSuccess', () => {
    it('should properly set the state', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: false,
      }

      // Act
      const nextState = reducer(initialState, signInSuccess())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        oauth: {
          cloud: nextState
        }
      })
      expect(oauthCloudSelector(rootState)).toEqual(state)
    })
  })

  describe('signInFailure', () => {
    it('should properly set the error', () => {
      // Arrange
      const data = 'some error'
      const state = {
        ...initialState,
        loading: false,
        error: data,
      }

      // Act
      const nextState = reducer(initialState, signInFailure(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        oauth: {
          cloud: nextState
        }
      })
      expect(oauthCloudSelector(rootState)).toEqual(state)
    })
  })

  describe('getAccountInfo', () => {
    it('should properly set loading = true', () => {
      // Arrange
      const state = {
        ...initialState,
        account: {
          ...initialState.account,
          loading: true,
        }
      }

      // Act
      const nextState = reducer(initialState, getAccountInfo())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        oauth: {
          cloud: nextState
        }
      })
      expect(oauthCloudSelector(rootState)).toEqual(state)
    })
  })

  describe('getAccountInfoSuccess', () => {
    it('should properly set the state with fetched data', () => {
      const data = {}
      // Arrange
      const state = {
        ...initialState,
        account: {
          ...initialState.account,
          loading: false,
          currentAccount: data
        }
      }

      // Act
      const nextState = reducer(initialState, getAccountInfoSuccess(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        oauth: {
          cloud: nextState
        }
      })
      expect(oauthCloudSelector(rootState)).toEqual(state)
    })
  })

  describe('getAccountInfoFailure', () => {
    it('should properly set the error', () => {
      // Arrange
      const data = 'some error'
      const state = {
        ...initialState,
        account: {
          ...initialState.account,
          loading: false,
          error: data,
        }
      }

      // Act
      const nextState = reducer(initialState, getAccountInfoFailure(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        oauth: {
          cloud: nextState
        }
      })
      expect(oauthCloudSelector(rootState)).toEqual(state)
    })
  })

  describe('setSignInDialogState', () => {
    it('should properly set the source=SignInDialogSource.BrowserSearch and isOpen=true', () => {
      // Arrange
      const state = {
        isOpen: true,
        source: SignInDialogSource.BrowserSearch,
      }

      // Act
      const nextState = reducer(initialState, setSignInDialogState(SignInDialogSource.BrowserSearch))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        oauth: { cloud: nextState },
      })
      expect(oauthCloudSignInDialogSelector(rootState)).toEqual(state)
    })
    it('should properly set the isOpen=false if source=null', () => {
      // Arrange
      const prevInitialState = {
        ...initialState,
        signInDialog: {
          isOpen: true,
          source: SignInDialogSource.BrowserSearch,
        }
      }
      const state = {
        isOpen: false,
        source: null,
      }

      // Act
      const nextState = reducer(prevInitialState, setSignInDialogState(null))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        oauth: { cloud: nextState },
      })
      expect(oauthCloudSignInDialogSelector(rootState)).toEqual(state)
    })
  })

  describe('thunks', () => {
    it('call both fetchAccountInfo and getAccountInfoSuccess when fetch is successed', async () => {
      // Arrange
      const data = [
        { id: '70b95d32-c19d-4311-bb24-e684af12cf15' },
      ]
      const responsePayload = { data, status: 200 }

      apiService.get = jest.fn().mockResolvedValue(responsePayload)

      // Act
      await store.dispatch<any>(fetchAccountInfo())

      // Assert
      const expectedActions = [
        getAccountInfo(),
        getAccountInfoSuccess(responsePayload.data),
      ]
      expect(store.getActions()).toEqual(expectedActions)
    })

    it('call both fetchAccountInfo and getAccountInfoFailure when fetch is fail', async () => {
      // Arrange
      const errorMessage = 'Could not connect to aoeu:123, please check the connection details.'
      const responsePayload = {
        response: {
          status: 500,
          data: { message: errorMessage },
        },
      }

      apiService.get = jest.fn().mockRejectedValueOnce(responsePayload)

      // Act
      await store.dispatch<any>(fetchAccountInfo())

      // Assert
      const expectedActions = [
        getAccountInfo(),
        addErrorNotification(responsePayload as AxiosError),
        getAccountInfoFailure(responsePayload.response.data.message),
      ]
      expect(store.getActions()).toEqual(expectedActions)
    })
  })
})
