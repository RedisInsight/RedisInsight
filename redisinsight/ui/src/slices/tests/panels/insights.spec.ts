import { cloneDeep } from 'lodash'
import reducer, {
  changeSelectedTab,
  explorePanelSelector,
  initialState,
  insightsPanelSelector,
  resetExplorePanelSearch,
  setExplorePanelContent,
  setExplorePanelIsPageOpen,
  setExplorePanelManifest,
  setExplorePanelScrollTop,
  setExplorePanelSearch,
  toggleInsightsPanel,
} from 'uiSrc/slices/panels/insights'
import { cleanup, initialStateDefault, mockedStore } from 'uiSrc/utils/test-utils'
import { InsightsPanelTabs } from 'uiSrc/slices/interfaces/insights'

let store: typeof mockedStore

beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('insights slice', () => {
  describe('reducer, actions and selectors', () => {
    it('should return the initial state on first run', () => {
      // Arrange
      const nextState = initialState

      // Act
      const result = reducer(undefined, {})

      // Assert
      expect(result).toEqual(nextState)
    })

    describe('toggleInsightsPanel', () => {
      it('should properly set state', () => {
        // Arrange
        const state = {
          ...initialState,
          isOpen: true,
        }

        // Act
        const nextState = reducer(initialState, toggleInsightsPanel())

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          panels: { insights: nextState },
        })
        expect(insightsPanelSelector(rootState)).toEqual(state)
      })

      it('should properly set state with provided value', () => {
        // Arrange
        const state = {
          ...initialState,
          isOpen: false,
        }

        // Act
        const nextState = reducer(initialState, toggleInsightsPanel(false))

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          panels: { insights: nextState },
        })
        expect(insightsPanelSelector(rootState)).toEqual(state)
      })
    })

    describe('changeSelectedTab', () => {
      it('should properly set state', () => {
        // Arrange
        const state = {
          ...initialState,
          tabSelected: InsightsPanelTabs.Recommendations,
        }

        // Act
        const nextState = reducer(initialState, changeSelectedTab(InsightsPanelTabs.Recommendations))

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          panels: { insights: nextState },
        })
        expect(insightsPanelSelector(rootState)).toEqual(state)
      })
    })

    describe('setExplorePanelSearch', () => {
      it('should properly set state', () => {
        // Arrange
        const search = 'path/0/1'
        const currentState = {
          ...initialState,
          explore: {
            ...initialState.explore,
            itemScrollTop: 100
          }
        }
        const state = {
          ...initialState,
          explore: {
            ...initialState.explore,
            search,
          }
        }

        // Act
        const nextState = reducer(currentState, setExplorePanelSearch(search))

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          panels: { insights: nextState },
        })
        expect(insightsPanelSelector(rootState)).toEqual(state)
      })
    })

    describe('setExplorePanelScrollTop', () => {
      it('should properly set state', () => {
        // Arrange
        const state = {
          ...initialState,
          explore: {
            ...initialState.explore,
            itemScrollTop: 100
          }
        }

        // Act
        const nextState = reducer(initialState, setExplorePanelScrollTop(100))

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          panels: { insights: nextState },
        })
        expect(insightsPanelSelector(rootState)).toEqual(state)
      })
    })

    describe('resetExplorePanelSearch', () => {
      it('should properly set state', () => {
        // Arrange
        const currentState = {
          ...initialState,
          explore: {
            ...initialState.explore,
            search: 'path/1/1',
            itemScrollTop: 100
          }
        }

        const state = {
          ...initialState,
          explore: {
            ...initialState.explore,
          }
        }

        // Act
        const nextState = reducer(currentState, resetExplorePanelSearch())

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          panels: { insights: nextState },
        })
        expect(insightsPanelSelector(rootState)).toEqual(state)
      })
    })

    describe('setExplorePanelContent', () => {
      it('should properly set state', () => {
        // Arrange
        const data = {
          data: 'any content',
          url: 'url:123'
        }
        const state = {
          ...initialState.explore,
          ...data
        }

        // Act
        const nextState = reducer(initialState, setExplorePanelContent(data))

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          panels: { insights: nextState },
        })
        expect(explorePanelSelector(rootState)).toEqual(state)
      })
    })

    describe('setExplorePanelIsPageOpen', () => {
      it('should properly set state', () => {
        // Arrange
        const state = {
          ...initialState.explore,
          isPageOpen: true
        }

        // Act
        const nextState = reducer(initialState, setExplorePanelIsPageOpen(true))

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          panels: { insights: nextState },
        })
        expect(explorePanelSelector(rootState)).toEqual(state)
      })
    })

    describe('setExplorePanelManifest', () => {
      it('should properly set state', () => {
        // Arrange
        const manifest = {
          page1: '1'
        }
        const state = {
          ...initialState.explore,
          manifest
        }

        // Act
        const nextState = reducer(initialState, setExplorePanelManifest(manifest))

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          panels: { insights: nextState },
        })
        expect(explorePanelSelector(rootState)).toEqual(state)
      })
    })
  })
})
