import { cloneDeep } from 'lodash'
import { AxiosError } from 'axios'
import { cleanup, initialStateDefault, mockedStore } from 'uiSrc/utils/test-utils'
import reducer, {
  initialState,
  setConnectedInstance,
  setConnectedInstanceSuccess,
  setConnectedInstanceFailure,
  resetConnectedInstance,
  setDefaultInstance,
  setDefaultInstanceSuccess,
  setDefaultInstanceFailure,
  instancesSelector,
  fetchConnectedInstanceAction,
  checkConnectToRdiInstanceAction,
} from 'uiSrc/slices/rdi/instances'
import { apiService } from 'uiSrc/services'
import { addErrorNotification, IAddInstanceErrorPayload } from 'uiSrc/slices/app/notifications'
import { RdiInstance } from 'uiSrc/slices/interfaces'

let store: typeof mockedStore

const mockRdiInstance = { name: 'name', version: '1.2', url: 'http://localhost:4000' }

beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('rdi instances slice', () => {
  describe('setConnectedInstance', () => {
    it('should properly set loading=true', () => {
      // Arrange
      const state = {
        ...initialState,
      }
      // Act
      const nextState = reducer(initialState, setConnectedInstance())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        instances: nextState,
      })

      expect(instancesSelector(rootState)).toEqual(state)
    })
  })

  describe('setConnectedInstanceSuccess', () => {
    it('should properly set state', () => {
      // Arrange
      const state = {
        ...initialState,
        connectedInstance: mockRdiInstance,
      }

      // Act
      const nextState = reducer(initialState, setConnectedInstanceSuccess(mockRdiInstance as RdiInstance))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        rdi: {
          instances: nextState
        },
      })
      expect(instancesSelector(rootState)).toEqual(state)
    })
  })

  describe('setConnectedInstanceFailure', () => {
    it('should properly set state', () => {
      // Arrange
      const error = 'error'
      const state = {
        ...initialState,
        connectedInstance: {
          ...initialState.connectedInstance,
          loading: false,
          error,
        }
      }

      // Act
      const nextState = reducer(initialState, setConnectedInstanceFailure(error))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        rdi: {
          instances: nextState,
        },
      })
      expect(instancesSelector(rootState)).toEqual(state)
    })
  })

  describe('setDefaultInstance', () => {
    it('should properly set loading=true', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
        error: '',
      }
      // Act
      const nextState = reducer(initialState, setDefaultInstance())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        rdi: {
          instances: nextState
        },
      })

      expect(instancesSelector(rootState)).toEqual(state)
    })
  })

  describe('setDefaultInstanceSuccess', () => {
    it('should properly set loading=false', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: false,
      }

      // Act
      const nextState = reducer(initialState, setDefaultInstanceSuccess())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        rdi: {
          instances: nextState
        },
      })
      expect(instancesSelector(rootState)).toEqual(state)
    })
  })

  describe('setDefaultInstanceFailure', () => {
    it('should properly set state', () => {
      // Arrange
      const error = 'error'
      const state = {
        ...initialState,
        loading: false,
        error,
      }

      // Act
      const nextState = reducer(initialState, setDefaultInstanceFailure(error))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        rdi: {
          instances: nextState,
        },
      })
      expect(instancesSelector(rootState)).toEqual(state)
    })
  })

  // thunks

  describe('thunks', () => {
    describe('fetchConnectedInstanceAction', () => {
      it('succeed to fetch data', async () => {
        const responsePayload = { data: mockRdiInstance, status: 200 }

        apiService.get = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(
          fetchConnectedInstanceAction('123')
        )

        // Assert
        const expectedActions = [
          setConnectedInstance(),
          setConnectedInstanceSuccess(mockRdiInstance as RdiInstance),
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
          fetchConnectedInstanceAction('123')
        )

        // Assert
        const expectedActions = [
          setConnectedInstance(),
          setConnectedInstanceFailure(errorMessage),
          addErrorNotification(responsePayload as AxiosError),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('checkConnectToRdiInstanceAction', () => {
      it('succeed to fetch data', async () => {
        const responsePayload = { status: 200 }

        apiService.get = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(
          checkConnectToRdiInstanceAction('123')
        )

        // Assert
        const expectedActions = [
          setDefaultInstance(),
          resetConnectedInstance(),
          setDefaultInstanceSuccess(),
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
        await store.dispatch<any>(checkConnectToRdiInstanceAction('123'))

        // Assert
        const expectedActions = [
          setDefaultInstance(),
          resetConnectedInstance(),
          setDefaultInstanceFailure(errorMessage),
          addErrorNotification({ ...responsePayload, instanceId: '123' } as IAddInstanceErrorPayload),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })
  })
})
