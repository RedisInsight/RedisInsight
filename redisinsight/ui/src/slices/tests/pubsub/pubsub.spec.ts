import { cloneDeep } from 'lodash'
import reducer, { initialState } from 'uiSrc/slices/slowlog/slowlog'
import { cleanup, mockedStore } from 'uiSrc/utils/test-utils'

let store: typeof mockedStore

beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('pubsub slice', () => {
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
})
