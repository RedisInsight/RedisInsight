import { cloneDeep } from 'lodash'
import { AxiosError } from 'axios'
import { cleanup, initialStateDefault, mockedStore } from 'uiSrc/utils/test-utils'
import reducer, {
  fetchTriggeredFunctionsLibrariesList,
  getTriggeredFunctionsLibrariesListFailure,
  getTriggeredFunctionsLibrariesList,
  getTriggeredFunctionsLibrariesListSuccess,
  initialState,
  triggeredFunctionsSelector,
  getTriggeredFunctionsLibraryDetails,
  getTriggeredFunctionsLibraryDetailsSuccess,
  getTriggeredFunctionsLibraryDetailsFailure,
  replaceTriggeredFunctionsLibrary,
  replaceTriggeredFunctionsLibrarySuccess,
  replaceTriggeredFunctionsLibraryFailure,
  fetchTriggeredFunctionsLibrary,
  replaceTriggeredFunctionsLibraryAction,
  deleteTriggeredFunctionsLibrary,
  deleteTriggeredFunctionsLibrarySuccess,
  deleteTriggeredFunctionsLibraryFailure,
  deleteTriggeredFunctionsLibraryAction,
} from 'uiSrc/slices/triggeredFunctions/triggeredFunctions'
import { apiService } from 'uiSrc/services'
import { addMessageNotification, addErrorNotification } from 'uiSrc/slices/app/notifications'
import successMessages from 'uiSrc/components/notifications/success-messages'
import {
  TRIGGERED_FUNCTIONS_LIB_DETAILS_MOCKED_DATA
} from 'uiSrc/mocks/handlers/triggeredFunctions/triggeredFunctionsHandler'
import { TriggeredFunctionsLibrary } from 'uiSrc/slices/interfaces/triggeredFunctions'

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
        loading: true
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
        lastRefresh: Date.now(),
        libraries
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
        error,
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

    describe('deleteTriggeredFunctionsLibrary', () => {
      it('should properly set state', () => {
        // Arrange
        const state = {
          ...initialState,
          deleting: true
        }

        // Act
        const nextState = reducer(initialState, deleteTriggeredFunctionsLibrary())

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          triggeredFunctions: nextState,
        })
        expect(triggeredFunctionsSelector(rootState)).toEqual(state)
      })
    })

    describe('deleteTriggeredFunctionsLibrarySuccess', () => {
      it('should properly set state', () => {
        const libraries: TriggeredFunctionsLibrary[] = [
          { name: 'lib1', user: 'user1', pendingJobs: 0, totalFunctions: 0 },
        ]
        // Arrange
        const currentState = {
          ...initialState,
          libraries,
          deleting: true,
        }
        const state = {
          ...initialState,
          libraries: [],
          deleting: false,
        }

        // Act
        const nextState = reducer(currentState, deleteTriggeredFunctionsLibrarySuccess('lib1'))

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          triggeredFunctions: nextState,
        })
        expect(triggeredFunctionsSelector(rootState)).toEqual(state)
      })
    })

    describe('deleteTriggeredFunctionsLibraryFailure', () => {
      it('should properly set state', () => {
        // Arrange
        const currentState = {
          ...initialState,
          deleting: true,
        }
        const state = {
          ...initialState,
          deleting: false,
        }

        // Act
        const nextState = reducer(currentState, deleteTriggeredFunctionsLibraryFailure())

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          triggeredFunctions: nextState,
        })
        expect(triggeredFunctionsSelector(rootState)).toEqual(state)
      })
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

    describe('deleteTriggeredFunctionsLibraryAction', () => {
      it('succeed to delete libraries', async () => {
        const responsePayload = { status: 200 }

        apiService.delete = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(
          deleteTriggeredFunctionsLibraryAction('instanceId', 'name')
        )

        // Assert
        const expectedActions = [
          deleteTriggeredFunctionsLibrary(),
          deleteTriggeredFunctionsLibrarySuccess('name'),
          addMessageNotification(successMessages.DELETE_LIBRARY('name'))
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })

      it('failed to delete libraries', async () => {
        const errorMessage = 'Something was wrong!'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.delete = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(
          deleteTriggeredFunctionsLibraryAction('instanceId', 'name')
        )

        // Assert
        const expectedActions = [
          deleteTriggeredFunctionsLibrary(),
          addErrorNotification(responsePayload as AxiosError),
          deleteTriggeredFunctionsLibraryFailure()
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })
  })
})
