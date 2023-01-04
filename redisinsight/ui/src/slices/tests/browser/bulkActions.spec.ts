import { cloneDeep } from 'lodash'
import { BulkActionsType } from 'uiSrc/constants'
import reducer, {
  bulkActionsSelector,
  initialState,
  toggleBulkActionTriggered,
  toggleBulkActions,
  setBulkActionConnected,
  setLoading,
  setBulkActionType,
  setOverview,
  overviewBulkActionsSelector,
  disconnectBulkAction,
  bulkDeleteSuccess,
} from 'uiSrc/slices/browser/bulkActions'
import { cleanup, initialStateDefault, mockedStore } from 'uiSrc/utils/test-utils'

let store: typeof mockedStore

beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('bulkActions slice', () => {
  describe('reducer, actions and selectors', () => {
    it('should return the initial state on first run', () => {
      // Arrange
      const nextState = initialState

      // Act
      const result = reducer(undefined, {})

      // Assert
      expect(result).toEqual(nextState)
    })

    describe('toggleBulkActions', () => {
      it('should properly set state', () => {
        const currentState = {
          ...initialState,
          isShowBulkActions: true
        }

        // Arrange
        const state = {
          ...initialState,
          isShowBulkActions: false
        }

        // Act
        const nextState = reducer(currentState, toggleBulkActions())

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          browser: { bulkActions: nextState },
        })
        expect(bulkActionsSelector(rootState)).toEqual(state)
      })
    })

    describe('setBulkActionConnected', () => {
      it('should properly set state', () => {
        // Arrange
        const state = {
          ...initialState,
          isConnected: true
        }

        // Act
        const nextState = reducer(initialState, setBulkActionConnected(true))

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          browser: { bulkActions: nextState },
        })
        expect(bulkActionsSelector(rootState)).toEqual(state)
      })
    })

    describe('setLoading', () => {
      it('should properly set state', () => {
        // Arrange
        const state = {
          ...initialState,
          loading: true
        }

        // Act
        const nextState = reducer(initialState, setLoading(true))

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          browser: { bulkActions: nextState },
        })
        expect(bulkActionsSelector(rootState)).toEqual(state)
      })
    })

    describe('setBulkActionType', () => {
      it('should properly set state', () => {
        // Arrange
        const state = {
          ...initialState,
          selectedBulkAction: {
            ...initialState.selectedBulkAction,
            type: BulkActionsType.Delete
          }
        }

        // Act
        const nextState = reducer(initialState, setBulkActionType(BulkActionsType.Delete))

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          browser: { bulkActions: nextState },
        })
        expect(bulkActionsSelector(rootState)).toEqual(state)
      })
    })

    describe('toggleBulkActionTriggered', () => {
      it('should properly set state', () => {
        // Arrange
        const state = {
          ...initialState,
          isActionTriggered: true
        }

        // Act
        const nextState = reducer(initialState, toggleBulkActionTriggered())

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          browser: { bulkActions: nextState },
        })
        expect(bulkActionsSelector(rootState)).toEqual(state)
      })
    })

    describe('setOverview', () => {
      it('should properly set state', () => {
        // Arrange
        const data = {
          id: 1,
          databaseId: '1',
          duration: 300,
          status: 'completed',
          type: BulkActionsType.Delete,
          summary: { processed: 1, succeed: 1, failed: 0, errors: [] },
        }

        const overview = {
          ...data
        }

        // Act
        const nextState = reducer(initialState, setOverview(data))

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          browser: { bulkActions: nextState },
        })
        expect(overviewBulkActionsSelector(rootState)).toEqual(overview)
      })
    })

    describe('disconnectBulkAction', () => {
      it('should properly set state', () => {
        // Arrange
        const currentState = {
          ...initialState,
          loading: true,
          isActionTriggered: true,
          isConnected: true,
        }

        // Act
        const nextState = reducer(currentState, disconnectBulkAction())

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          browser: { bulkActions: nextState },
        })
        expect(bulkActionsSelector(rootState)).toEqual(initialState)
      })
    })

    describe('bulkDeleteSuccess', () => {
      it('should properly set state', () => {
        // Arrange
        const currentState = {
          ...initialState,
          loading: true
        }

        // Act
        const nextState = reducer(currentState, bulkDeleteSuccess())

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          browser: { bulkActions: nextState },
        })
        expect(bulkActionsSelector(rootState)).toEqual(initialState)
      })
    })
  })
})
