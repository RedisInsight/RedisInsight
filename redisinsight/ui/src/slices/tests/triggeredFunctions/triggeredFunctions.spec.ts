import { cloneDeep } from 'lodash'
import { AxiosError } from 'axios'
import { cleanup, initialStateDefault, mockedStore } from 'uiSrc/utils/test-utils'
import reducer, {
  fetchTriggeredFunctionsFunctionsList,
  fetchTriggeredFunctionsLibrariesList,
  fetchTriggeredFunctionsLibrary,
  getTriggeredFunctionsFunctionsList,
  getTriggeredFunctionsFunctionsListFailure,
  getTriggeredFunctionsFunctionsListSuccess,
  getTriggeredFunctionsLibrariesList,
  getTriggeredFunctionsLibrariesListFailure,
  getTriggeredFunctionsLibrariesListSuccess,
  getTriggeredFunctionsLibraryDetails,
  getTriggeredFunctionsLibraryDetailsFailure,
  getTriggeredFunctionsLibraryDetailsSuccess,
  initialState,
  replaceTriggeredFunctionsLibrary,
  replaceTriggeredFunctionsLibraryAction,
  replaceTriggeredFunctionsLibraryFailure,
  replaceTriggeredFunctionsLibrarySuccess,
  setSelectedFunctionToShow,
  setSelectedLibraryToShow,
  triggeredFunctionsSelector
} from 'uiSrc/slices/triggeredFunctions/triggeredFunctions'
import { apiService } from 'uiSrc/services'
import { addErrorNotification } from 'uiSrc/slices/app/notifications'
import { TRIGGERED_FUNCTIONS_LIB_DETAILS_MOCKED_DATA } from 'uiSrc/mocks/data/triggeredFunctions'
import { FunctionType, TriggeredFunctionsFunction } from 'uiSrc/slices/interfaces/triggeredFunctions'

let store: typeof mockedStore

beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

const timestamp = 1629128049027
let dateNow: jest.SpyInstance<number>

describe('triggeredFunctions slice', () => {
  beforeAll(() => {
    dateNow = jest.spyOn(Date, 'now').mockImplementation(() => timestamp)
  })

  afterAll(() => {
    dateNow.mockRestore()
  })

  describe('reducer, actions and selectors', () => {
    it('should return the initial state', () => {
      // Arrange
      const nextState = initialState

      // Act
      const result = reducer(undefined, {})

      // Assert
      expect(result).toEqual(nextState)
    })
  })

  describe('getTriggeredFunctionsLibrariesList', () => {
    it('should properly set state', () => {
      // Arrange
      const state = {
        ...initialState,
        libraries: {
          ...initialState.libraries,
          loading: true
        }
      }

      // Act
      const nextState = reducer(initialState, getTriggeredFunctionsLibrariesList())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        triggeredFunctions: nextState,
      })
      expect(triggeredFunctionsSelector(rootState)).toEqual(state)
    })
  })

  describe('getTriggeredFunctionsLibrariesListSuccess', () => {
    it('should properly set state', () => {
      // Arrange
      const libraries = [{ name: 'lib1', user: 'user1' }]
      const state = {
        ...initialState,
        libraries: {
          ...initialState.libraries,
          lastRefresh: Date.now(),
          data: libraries
        }
      }

      // Act
      const nextState = reducer(initialState, getTriggeredFunctionsLibrariesListSuccess(libraries))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        triggeredFunctions: nextState,
      })
      expect(triggeredFunctionsSelector(rootState)).toEqual(state)
    })
  })

  describe('getTriggeredFunctionsLibrariesListFailure', () => {
    it('should properly set state', () => {
      // Arrange
      const error = 'error'
      const state = {
        ...initialState,
        libraries: {
          ...initialState.libraries,
          error
        }
      }

      // Act
      const nextState = reducer(initialState, getTriggeredFunctionsLibrariesListFailure(error))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        triggeredFunctions: nextState,
      })
      expect(triggeredFunctionsSelector(rootState)).toEqual(state)
    })
  })

  describe('getTriggeredFunctionsFunctionsList', () => {
    it('should properly set state', () => {
      // Arrange
      const state = {
        ...initialState,
        functions: {
          ...initialState.functions,
          loading: true
        }
      }

      // Act
      const nextState = reducer(initialState, getTriggeredFunctionsFunctionsList())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        triggeredFunctions: nextState,
      })
      expect(triggeredFunctionsSelector(rootState)).toEqual(state)
    })
  })

  describe('getTriggeredFunctionsFunctionsListSuccess', () => {
    it('should properly set state', () => {
      // Arrange
      const functions = [{ name: 'foo' }]
      const state = {
        ...initialState,
        functions: {
          ...initialState.functions,
          lastRefresh: Date.now(),
          data: functions
        }
      }

      // Act
      const nextState = reducer(initialState, getTriggeredFunctionsFunctionsListSuccess(functions))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        triggeredFunctions: nextState,
      })
      expect(triggeredFunctionsSelector(rootState)).toEqual(state)
    })
  })

  describe('getTriggeredFunctionsFunctionsListFailure', () => {
    it('should properly set state', () => {
      // Arrange
      const error = 'error'
      const state = {
        ...initialState,
        functions: {
          ...initialState.functions,
          error
        }
      }

      // Act
      const nextState = reducer(initialState, getTriggeredFunctionsFunctionsListFailure(error))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        triggeredFunctions: nextState,
      })
      expect(triggeredFunctionsSelector(rootState)).toEqual(state)
    })
  })

  describe('setSelectedFunctionToShow', () => {
    it('should properly set state', () => {
      // Arrange
      const func: TriggeredFunctionsFunction = {
        name: 'foo',
        type: FunctionType.Function,
        library: 'lib'
      }

      const state = {
        ...initialState,
        functions: {
          ...initialState.functions,
          selected: func
        }
      }

      // Act
      const nextState = reducer(initialState, setSelectedFunctionToShow(func))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        triggeredFunctions: nextState,
      })
      expect(triggeredFunctionsSelector(rootState)).toEqual(state)
    })
  })

  describe('setSelectedLibraryToShow', () => {
    it('should properly set state', () => {
      // Arrange
      const lib = 'lib'

      const state = {
        ...initialState,
        libraries: {
          ...initialState.libraries,
          selected: lib
        }
      }

      // Act
      const nextState = reducer(initialState, setSelectedLibraryToShow(lib))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        triggeredFunctions: nextState,
      })
      expect(triggeredFunctionsSelector(rootState)).toEqual(state)
    })
  })

  describe('getTriggeredFunctionsLibraryDetails', () => {
    it('should properly set state', () => {
      // Arrange
      const state = {
        ...initialState,
        selectedLibrary: {
          ...initialState.selectedLibrary,
          loading: true
        }
      }

      // Act
      const nextState = reducer(initialState, getTriggeredFunctionsLibraryDetails())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        triggeredFunctions: nextState,
      })
      expect(triggeredFunctionsSelector(rootState)).toEqual(state)
    })
  })

  describe('getTriggeredFunctionsLibraryDetailsSuccess', () => {
    it('should properly set state', () => {
      // Arrange
      const libraryDetails = TRIGGERED_FUNCTIONS_LIB_DETAILS_MOCKED_DATA
      const state = {
        ...initialState,
        selectedLibrary: {
          ...initialState.selectedLibrary,
          lastRefresh: Date.now(),
          data: libraryDetails
        }
      }

      // Act
      const nextState = reducer(initialState, getTriggeredFunctionsLibraryDetailsSuccess(libraryDetails))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        triggeredFunctions: nextState,
      })
      expect(triggeredFunctionsSelector(rootState)).toEqual(state)
    })
  })

  describe('getTriggeredFunctionsLibraryDetailsFailure', () => {
    it('should properly set state', () => {
      // Arrange
      const currentState = {
        ...initialState,
        selectedLibrary: {
          ...initialState.selectedLibrary,
          loading: true
        }
      }
      const state = {
        ...initialState,
        selectedLibrary: {
          ...initialState.selectedLibrary,
          loading: false
        },
      }

      // Act
      const nextState = reducer(currentState, getTriggeredFunctionsLibraryDetailsFailure())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        triggeredFunctions: nextState,
      })
      expect(triggeredFunctionsSelector(rootState)).toEqual(state)
    })
  })

  describe('replaceTriggeredFunctionsLibrary', () => {
    it('should properly set state', () => {
      // Arrange
      const state = {
        ...initialState,
        selectedLibrary: {
          ...initialState.selectedLibrary,
          loading: true
        }
      }

      // Act
      const nextState = reducer(initialState, replaceTriggeredFunctionsLibrary())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        triggeredFunctions: nextState,
      })
      expect(triggeredFunctionsSelector(rootState)).toEqual(state)
    })
  })

  describe('replaceTriggeredFunctionsLibrarySuccess', () => {
    it('should properly set state', () => {
      // Arrange
      const currentState = {
        ...initialState,
        selectedLibrary: {
          ...initialState.selectedLibrary,
          loading: true
        }
      }
      const state = {
        ...initialState,
        selectedLibrary: {
          ...initialState.selectedLibrary,
          loading: false,
        },
      }

      // Act
      const nextState = reducer(currentState, replaceTriggeredFunctionsLibrarySuccess())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        triggeredFunctions: nextState,
      })
      expect(triggeredFunctionsSelector(rootState)).toEqual(state)
    })
  })

  describe('replaceTriggeredFunctionsLibraryFailure', () => {
    it('should properly set state', () => {
      // Arrange
      const currentState = {
        ...initialState,
        selectedLibrary: {
          ...initialState.selectedLibrary,
          loading: true
        }
      }
      const state = {
        ...initialState,
        selectedLibrary: {
          ...initialState.selectedLibrary,
          loading: false
        },
      }

      // Act
      const nextState = reducer(currentState, replaceTriggeredFunctionsLibraryFailure())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        triggeredFunctions: nextState,
      })
      expect(triggeredFunctionsSelector(rootState)).toEqual(state)
    })
  })

  // thunks

  describe('thunks', () => {
    describe('fetchTriggeredFunctionsLibrariesList', () => {
      it('succeed to fetch data', async () => {
        const data = [{ name: 'lib1', user: 'default' }]
        const responsePayload = { data, status: 200 }

        apiService.get = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(
          fetchTriggeredFunctionsLibrariesList('123')
        )

        // Assert
        const expectedActions = [
          getTriggeredFunctionsLibrariesList(),
          getTriggeredFunctionsLibrariesListSuccess(data),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })

      it('failed to fetch data', async () => {
        const errorMessage = 'Something was wrong!'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.get = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(
          fetchTriggeredFunctionsLibrariesList('123')
        )

        // Assert
        const expectedActions = [
          getTriggeredFunctionsLibrariesList(),
          addErrorNotification(responsePayload as AxiosError),
          getTriggeredFunctionsLibrariesListFailure(errorMessage)
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('fetchTriggeredFunctionsFunctionsList', () => {
      it('succeed to fetch data', async () => {
        const data: TriggeredFunctionsFunction[] = [
          { name: 'foo', library: 'lib', type: 'functions' as FunctionType }
        ]
        const responsePayload = { data, status: 200 }

        apiService.get = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(
          fetchTriggeredFunctionsFunctionsList('123')
        )

        // Assert
        const expectedActions = [
          getTriggeredFunctionsFunctionsList(),
          getTriggeredFunctionsFunctionsListSuccess(data),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })

      it('failed to fetch data', async () => {
        const errorMessage = 'Something was wrong!'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.get = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(
          fetchTriggeredFunctionsFunctionsList('123')
        )

        // Assert
        const expectedActions = [
          getTriggeredFunctionsFunctionsList(),
          addErrorNotification(responsePayload as AxiosError),
          getTriggeredFunctionsFunctionsListFailure(errorMessage)
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('fetchTriggeredFunctionsLibrary', () => {
      it('succeed to fetch data', async () => {
        const data = TRIGGERED_FUNCTIONS_LIB_DETAILS_MOCKED_DATA
        const responsePayload = { data, status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(
          fetchTriggeredFunctionsLibrary('123', 'lib')
        )

        // Assert
        const expectedActions = [
          getTriggeredFunctionsLibraryDetails(),
          getTriggeredFunctionsLibraryDetailsSuccess(data),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })

      it('failed to fetch data', async () => {
        const errorMessage = 'Something was wrong!'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.post = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(
          fetchTriggeredFunctionsLibrary('123', 'lib')
        )

        // Assert
        const expectedActions = [
          getTriggeredFunctionsLibraryDetails(),
          addErrorNotification(responsePayload as AxiosError),
          getTriggeredFunctionsLibraryDetailsFailure()
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('replaceTriggeredFunctionsLibraryAction', () => {
      it('succeed to fetch data', async () => {
        const responsePayload = { status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(
          replaceTriggeredFunctionsLibraryAction('123', 'code', 'config')
        )

        // Assert
        const expectedActions = [
          replaceTriggeredFunctionsLibrary(),
          replaceTriggeredFunctionsLibrarySuccess(),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })

      it('failed to fetch data', async () => {
        const errorMessage = 'Something was wrong!'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.post = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(
          replaceTriggeredFunctionsLibraryAction('123', 'code', 'config')
        )

        // Assert
        const expectedActions = [
          replaceTriggeredFunctionsLibrary(),
          addErrorNotification(responsePayload as AxiosError),
          replaceTriggeredFunctionsLibraryFailure()
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })
  })
})
