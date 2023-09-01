import { cloneDeep } from 'lodash'
import {
  cleanup,
  initialStateDefault,
  mockedStore,
} from 'uiSrc/utils/test-utils'
import { ActionBarStatus } from 'uiSrc/slices/interfaces'
import reducer, {
  initialState,
  setActionBarInitialState,
  setActionBarState,
  appActionBarSelector,
} from '../../app/actionBar'

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('actionBar slice', () => {
  describe('setActionBarInitialState', () => {
    it('should properly set initial state', () => {
      const nextState = reducer(initialState, setActionBarInitialState())
      const rootState = Object.assign(initialStateDefault, {
        app: { actionBar: nextState },
      })
      expect(appActionBarSelector(rootState)).toEqual(initialState)
    })
  })

  describe('setActionBarState', () => {
    it('should properly set state', () => {
      // Arrange
      const payload = {
        text: '1',
        actions: [{ label: '1' }, { label: '2' }],
        status: ActionBarStatus.Success
      }

      const state = {
        ...initialState,
        ...payload,
      }

      // Act
      const nextState = reducer(initialState, setActionBarState(payload))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { actionBar: nextState },
      })
      expect(appActionBarSelector(rootState)).toEqual(state)
    })
  })
})
