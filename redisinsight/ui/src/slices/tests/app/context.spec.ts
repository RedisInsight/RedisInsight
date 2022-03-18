import { cloneDeep } from 'lodash'
import { KeyTypes } from 'uiSrc/constants'

import {
  cleanup,
  initialStateDefault,
  mockedStore,
} from 'uiSrc/utils/test-utils'
import reducer, {
  initialState,
  setAppContextInitialState,
  setAppContextConnectedInstanceId,
  setBrowserKeyListDataLoaded,
  setBrowserSelectedKey,
  setBrowserKeyListScrollPosition,
  setBrowserPanelSizes,
  setWorkbenchScript,
  setWorkbenchVerticalPanelSizes,
  setLastPageContext,
  appContextSelector,
  appContextBrowser,
  appContextWorkbench,
  setWorkbenchEAGuide,
  appContextWorkbenchEA,
  setWorkbenchEAGuideScrollTop,
  resetWorkbenchEAGuide,
  setBrowserTreeNodesOpen,
  setBrowserTreePanelSizes,
  resetBrowserTree,
  appContextBrowserTree,
  setBrowserTreeSelectedLeaf
} from '../../app/context'

jest.mock('uiSrc/services')

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('slices', () => {
  describe('setAppContextInitialState', () => {
    it('should properly set initial state', () => {
      const nextState = reducer(initialState, setAppContextInitialState())
      const rootState = Object.assign(initialStateDefault, {
        app: { context: nextState },
      })
      expect(appContextSelector(rootState)).toEqual(initialState)
    })
  })

  describe('setAppContextConnectedInstanceId', () => {
    it('should properly set id', () => {
      // Arrange
      const contextInstanceId = '12312-3123'
      const state = {
        ...initialState,
        contextInstanceId
      }

      // Act
      const nextState = reducer(initialState, setAppContextConnectedInstanceId(contextInstanceId))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { context: nextState },
      })

      expect(appContextSelector(rootState)).toEqual(state)
    })
  })

  describe('setBrowserKeyListDataLoaded', () => {
    it('should properly set context is data loaded', () => {
      // Arrange
      const isDataLoaded = true
      const state = {
        ...initialState.browser,
        keyList: {
          ...initialState.browser.keyList,
          isDataLoaded
        }
      }

      // Act
      const nextState = reducer(initialState, setBrowserKeyListDataLoaded(isDataLoaded))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { context: nextState },
      })

      expect(appContextBrowser(rootState)).toEqual(state)
    })
  })

  describe('setBrowserSelectedKey', () => {
    it('should properly set selectedKey', () => {
      // Arrange
      const selectedKey = 'nameOfKey'
      const state = {
        ...initialState.browser,
        keyList: {
          ...initialState.browser.keyList,
          selectedKey
        }
      }

      // Act
      const nextState = reducer(initialState, setBrowserSelectedKey(selectedKey))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { context: nextState },
      })

      expect(appContextBrowser(rootState)).toEqual(state)
    })
  })

  describe('setBrowserKeyListScrollPosition', () => {
    it('should properly set scroll position of keyList', () => {
      // Arrange
      const scrollTopPosition = 530
      const state = {
        ...initialState.browser,
        keyList: {
          ...initialState.browser.keyList,
          scrollTopPosition
        }
      }

      // Act
      const nextState = reducer(initialState, setBrowserKeyListScrollPosition(scrollTopPosition))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { context: nextState },
      })

      expect(appContextBrowser(rootState)).toEqual(state)
    })
  })

  describe('setBrowserPanelSizes', () => {
    it('should properly set browser panel widths', () => {
      // Arrange
      const panelSizes = {
        first: 100,
        second: 200
      }
      const state = {
        ...initialState.browser,
        panelSizes
      }

      // Act
      const nextState = reducer(initialState, setBrowserPanelSizes(panelSizes))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { context: nextState },
      })

      expect(appContextBrowser(rootState)).toEqual(state)
    })
  })

  describe('setWorkbenchScript', () => {
    it('should properly set workbench script', () => {
      // Arrange
      const script = 'set 1 1 // 215 hset 5 21'
      const state = {
        ...initialState.workbench,
        script
      }

      // Act
      const nextState = reducer(initialState, setWorkbenchScript(script))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { context: nextState },
      })

      expect(appContextWorkbench(rootState)).toEqual(state)
    })
  })

  describe('setWorkbenchVerticalPanelSizes', () => {
    it('should properly set wb panel sizes', () => {
      // Arrange
      const panelSizes = {
        first: 100,
        second: 200
      }
      const state = {
        ...initialState.workbench,
        panelSizes: {
          ...initialState.workbench.panelSizes,
          vertical: panelSizes
        }
      }

      // Act
      const nextState = reducer(initialState, setWorkbenchVerticalPanelSizes(panelSizes))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { context: nextState },
      })

      expect(appContextWorkbench(rootState)).toEqual(state)
    })
  })

  describe('setWorkbenchEAGuide', () => {
    it('should properly set path to opened guide page', () => {
      // Arrange
      const prevState = {
        ...initialState,
        workbench: {
          ...initialState.workbench,
          enablementArea: {
            guidePath: 'static/enablement-area/guides/guide1.html',
            guideScrollTop: 200,
          }
        },
      }
      const guidePath = 'static/enablement-area/guides/guide2.html'
      const state = {
        ...initialState.workbench.enablementArea,
        guidePath,
        guideScrollTop: 0,
      }

      // Act
      const nextState = reducer(prevState, setWorkbenchEAGuide(guidePath))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { context: nextState },
      })

      expect(appContextWorkbenchEA(rootState)).toEqual(state)
    })
  })

  describe('setWorkbenchEAGuideScrollTop', () => {
    it('should properly set state', () => {
      // Arrange
      const state = {
        ...initialState.workbench.enablementArea,
        guideScrollTop: 200,
      }

      // Act
      const nextState = reducer(initialState, setWorkbenchEAGuideScrollTop(200))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { context: nextState },
      })

      expect(appContextWorkbenchEA(rootState)).toEqual(state)
    })
  })

  describe('resetWorkbenchEAGuide', () => {
    it('should properly reset enablement-area context', () => {
      // Arrange
      const prevState = {
        ...initialState,
        workbench: {
          ...initialState.workbench,
          enablementArea: {
            guidePath: 'static/enablement-area/guides/guide1.html',
            guideScrollTop: 200,
          }
        },
      }
      const state = {
        ...initialState.workbench.enablementArea,
        guidePath: '',
        guideScrollTop: 0,
      }

      // Act
      const nextState = reducer(prevState, resetWorkbenchEAGuide())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { context: nextState },
      })

      expect(appContextWorkbenchEA(rootState)).toEqual(state)
    })
  })

  describe('setLastPageContext', () => {
    it('should properly set last page', () => {
      // Arrange
      const lastPage = 'workbench'
      const state = {
        ...initialState,
        lastPage
      }

      // Act
      const nextState = reducer(initialState, setLastPageContext(lastPage))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { context: nextState },
      })

      expect(appContextSelector(rootState)).toEqual(state)
    })
  })
  describe('setBrowserTreeNodesOpen', () => {
    it('should properly set open nodes in the tree', () => {
      // Arrange
      const openNodes = {
        '1o2313': true,
        eu12313: false,
      }
      const prevState = {
        ...initialState,
        browser: {
          ...initialState.browser,
          tree: {
            ...initialState.browser.tree,
            openNodes
          }
        },
      }

      const state = {
        ...initialState.browser.tree,
        openNodes
      }

      // Act
      const nextState = reducer(prevState, setBrowserTreeNodesOpen(openNodes))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { context: nextState },
      })

      expect(appContextBrowserTree(rootState)).toEqual(state)
    })
  })
  describe('setBrowserTreeSelectedLeaf', () => {
    it('should properly set selected keys in the tree', () => {
      // Arrange
      const selectedLeaf = {
        key1: [{
          name: 'test',
          type: KeyTypes.Hash,
          ttl: 123,
          size: 123,
          length: 321
        }]
      }
      const prevState = {
        ...initialState,
        browser: {
          ...initialState.browser,
          tree: {
            ...initialState.browser.tree,
            selectedLeaf
          }
        },
      }

      const state = {
        ...initialState.browser.tree,
        selectedLeaf
      }

      // Act
      const nextState = reducer(prevState, setBrowserTreeSelectedLeaf(selectedLeaf))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { context: nextState },
      })

      expect(appContextBrowserTree(rootState)).toEqual(state)
    })
  })
  describe('setBrowserTreePanelSizes', () => {
    it('should properly set browser tree panel widths', () => {
      // Arrange
      const panelSizes = {
        first: 50,
        second: 400
      }
      const state = {
        ...initialState.browser.tree,
        panelSizes
      }

      // Act
      const nextState = reducer(initialState, setBrowserTreePanelSizes(panelSizes))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { context: nextState },
      })

      expect(appContextBrowserTree(rootState)).toEqual(state)
    })
  })
  describe('resetBrowserTree', () => {
    it('should properly set last page', () => {
      // Arrange
      const prevState = {
        ...initialState,
        browser: {
          ...initialState.browser,
          tree: {
            ...initialState.browser.tree,
            openNodes: {
              test: true
            },
            selectedLeaf: {
              key1: [{
                name: 'test',
                type: KeyTypes.Hash,
                ttl: 123,
                size: 123,
                length: 321
              }]
            }
          }
        },
      }
      const state = {
        ...initialState.browser.tree,
        openNodes: {},
        selectedLeaf: {}
      }

      // Act
      const nextState = reducer(prevState, resetBrowserTree())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { context: nextState },
      })

      expect(appContextBrowserTree(rootState)).toEqual(state)
    })
  })
})
