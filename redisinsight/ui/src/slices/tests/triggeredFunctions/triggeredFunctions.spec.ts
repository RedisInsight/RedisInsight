import { cloneDeep } from 'lodash'
import { AxiosError } from 'axios'
import { cleanup, initialStateDefault, mockedStore } from 'uiSrc/utils/test-utils'
import reducer, {
  fetchTriggeredFunctionsLibrariesList,
  getTriggeredFunctionsFailure,
  getTriggeredFunctionsList,
  getTriggeredFunctionsListSuccess,
  initialState,
  triggeredFunctionsSelector
} from 'uiSrc/slices/triggeredFunctions/triggeredFunctions'
import { apiService } from 'uiSrc/services'
import { addErrorNotification } from 'uiSrc/slices/app/notifications'

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

  describe('getTriggeredFunctionsList', () => {
    it('should properly set state', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true
      }

      // Act
      const nextState = reducer(initialState, getTriggeredFunctionsList())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        triggeredFunctions: nextState,
      })
      expect(triggeredFunctionsSelector(rootState)).toEqual(state)
    })
  })

  describe('getTriggeredFunctionsListSuccess', () => {
    it('should properly set state', () => {
      // Arrange
      const libraries = [{ name: 'lib1', user: 'user1' }]
      const state = {
        ...initialState,
        lastRefresh: Date.now(),
        libraries
      }

      // Act
      const nextState = reducer(initialState, getTriggeredFunctionsListSuccess(libraries))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        triggeredFunctions: nextState,
      })
      expect(triggeredFunctionsSelector(rootState)).toEqual(state)
    })
  })

  describe('getTriggeredFunctionsFailure', () => {
    it('should properly set state', () => {
      // Arrange
      const error = 'error'
      const state = {
        ...initialState,
        error,
      }

      // Act
      const nextState = reducer(initialState, getTriggeredFunctionsFailure(error))

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
          getTriggeredFunctionsList(),
          getTriggeredFunctionsListSuccess(data),
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
          getTriggeredFunctionsList(),
          addErrorNotification(responsePayload as AxiosError),
          getTriggeredFunctionsFailure(errorMessage)
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })
  })
})
