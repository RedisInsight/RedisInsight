import { AxiosError } from 'axios'
import { cloneDeep } from 'lodash'
import { apiService } from 'uiSrc/services'
import {
  cleanup,
  initialStateDefault,
  mockedStore,
} from 'uiSrc/utils/test-utils'
import reducer, {
  initialState,
  loadCaCerts,
  loadCaCertsSuccess,
  loadCaCertsFailure,
  caCertsSelector,
  fetchCaCerts,
} from '../../instances/caCerts'
import { addErrorNotification } from '../../app/notifications'

// jest.mock('uiSrc/services')
jest.mock('uiSrc/services', () => ({
  ...jest.requireActual('uiSrc/services'),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('caCerts slice', () => {
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

  describe('loadCaCerts', () => {
    it('should properly set loading = true', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
      }

      // Act
      const nextState = reducer(initialState, loadCaCerts())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          caCerts: nextState,
        },
      })
      expect(caCertsSelector(rootState)).toEqual(state)
    })
  })

  describe('loadCaCertsSuccess', () => {
    it('should properly set the state with fetched data', () => {
      // Arrange

      const data = [
        { id: '70b95d32-c19d-4311-bb24-e684af12cf15', name: 'ca cert' },
      ]
      const state = {
        ...initialState,
        loading: false,
        data,
      }

      // Act
      const nextState = reducer(initialState, loadCaCertsSuccess(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          caCerts: nextState,
        },
      })
      expect(caCertsSelector(rootState)).toEqual(state)
    })

    it('should properly set the state with empty data', () => {
      // Arrange
      const data: any = []

      const state = {
        ...initialState,
        loading: false,
        data,
      }

      // Act
      const nextState = reducer(initialState, loadCaCertsSuccess(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          caCerts: nextState,
        },
      })
      expect(caCertsSelector(rootState)).toEqual(state)
    })
  })

  describe('loadCaCertsFailure', () => {
    it('should properly set the error', () => {
      // Arrange
      const data = 'some error'
      const state = {
        ...initialState,
        loading: false,
        error: data,
        data: [],
      }

      // Act
      const nextState = reducer(initialState, loadCaCertsFailure(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          caCerts: nextState,
        },
      })
      expect(caCertsSelector(rootState)).toEqual(state)
    })
  })

  describe('thunks', () => {
    it('call both fetchCaCerts and loadCaCertsSuccess when fetch is successed', async () => {
      // Arrange
      const data = [
        { id: '70b95d32-c19d-4311-bb24-e684af12cf15', name: 'ca cert' },
      ]
      const responsePayload = { data, status: 200 }

      apiService.get = jest.fn().mockResolvedValue(responsePayload)

      // Act
      await store.dispatch<any>(fetchCaCerts())

      // Assert
      const expectedActions = [
        loadCaCerts(),
        loadCaCertsSuccess(responsePayload.data),
      ]
      expect(store.getActions()).toEqual(expectedActions)
    })

    it('call both fetchCaCerts and loadCaCertsFailure when fetch is fail', async () => {
      // Arrange
      const errorMessage = 'Could not connect to aoeu:123, please check the connection details.'
      const responsePayload = {
        response: {
          status: 500,
          data: { message: errorMessage },
        },
      }

      apiService.get = jest.fn().mockRejectedValueOnce(responsePayload)

      // Act
      await store.dispatch<any>(fetchCaCerts())

      // Assert
      const expectedActions = [
        loadCaCerts(),
        addErrorNotification(responsePayload as AxiosError),
        loadCaCertsFailure(responsePayload.response.data.message),
      ]
      expect(store.getActions()).toEqual(expectedActions)
    })
  })
})
