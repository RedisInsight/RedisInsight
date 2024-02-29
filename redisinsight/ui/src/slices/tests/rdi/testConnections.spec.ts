import { cloneDeep } from 'lodash'
import { AxiosError } from 'axios'
import { cleanup, initialStateDefault, mockedStore } from 'uiSrc/utils/test-utils'
import reducer, {
  initialState,
  testConnections,
  testConnectionsSuccess,
  testConnectionsFailure,
  rdiTestConnectionsSelector,
  testConnectionsAction,
} from 'uiSrc/slices/rdi/testConnections'
import { apiService } from 'uiSrc/services'
import { addErrorNotification } from 'uiSrc/slices/app/notifications'

const mockData = {
  success: [{ index: 0, status: 'success', endpoint: 'redis-13386.c278.us-east-1-4.ec2.cloud.redislabs.com:13386' }],
  fail: [],
}

let store: typeof mockedStore

beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('rdi test connections slice', () => {
  describe('rdiTestConnectionsSelector', () => {
    it('should properly set state', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
        results: null
      }

      // Act
      const nextState = reducer(initialState, testConnections())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        rdi: {
          testConnections: nextState,
        },
      })
      expect(rdiTestConnectionsSelector(rootState)).toEqual(state)
    })
  })

  describe('testConnectionsSuccess', () => {
    it('should properly set state', () => {
      // Arrange
      const state = {
        ...initialState,
        results: mockData,
        loading: false,
      }

      // Act
      const nextState = reducer(initialState, testConnectionsSuccess(mockData))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        rdi: {
          testConnections: nextState,
        },
      })
      expect(rdiTestConnectionsSelector(rootState)).toEqual(state)
    })
  })

  describe('testConnectionsFailure', () => {
    it('should properly set state', () => {
      // Arrange
      const error = 'error'
      const state = {
        ...initialState,
        error,
      }

      // Act
      const nextState = reducer(initialState, testConnectionsFailure(error))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        rdi: {
          testConnections: nextState,
        },
      })
      expect(rdiTestConnectionsSelector(rootState)).toEqual(state)
    })
  })

  // thunks

  describe('thunks', () => {
    describe('testConnectionsAction', () => {
      it('succeed to fetch data', async () => {
        const responsePayload = { data: mockData, status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(
          testConnectionsAction('123', 'config')
        )

        // Assert
        const expectedActions = [
          testConnections(),
          testConnectionsSuccess(mockData),
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
          testConnectionsAction('123', 'config')
        )

        // Assert
        const expectedActions = [
          testConnections(),
          addErrorNotification(responsePayload as AxiosError),
          testConnectionsFailure(errorMessage)
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })
  })
})
