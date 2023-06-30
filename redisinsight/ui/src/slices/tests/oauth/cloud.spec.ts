import { initialStateDefault } from 'uiSrc/utils/test-utils'

import { SignInDialogSource } from 'uiSrc/slices/interfaces'
import reducer, {
  initialState,
  setSignInDialogState,
  oauthCloudSignInDialogSelector,
} from '../../oauth/cloud'

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
})
