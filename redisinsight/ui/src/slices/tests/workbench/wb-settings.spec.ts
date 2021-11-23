import { cloneDeep } from 'lodash'
import { apiService } from 'uiSrc/services'
import { cleanup, mockedStore, initialStateDefault } from 'uiSrc/utils/test-utils'
import reducer, {
  createWBClientAction,
  initialState,
  processWBClient,
  processWBClientFailure,
  processWBClientSuccess,
  workbenchSettingsSelector,
  updateWBClientAction,
} from '../../workbench/wb-settings'

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

jest.mock('uiSrc/services', () => ({
  ...jest.requireActual('uiSrc/services'),
  localStorageService: {
    set: jest.fn(),
    get: jest.fn(),
  },
}))

describe('workbenchSettings slice', () => {
  describe('processWBClient', () => {
    it('should properly set loading = true', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
      }

      // Act
      const nextState = reducer(initialState, processWBClient())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        workbench: {
          settings: nextState,
        },
      })
      expect(workbenchSettingsSelector(rootState)).toEqual(state)
    })
  })

  describe('processWBClientSuccess', () => {
    it('should properly set the state with fetched data', () => {
      // Arrange

      const data = { uuid: '70b95d32-c19d-4311-bb24-e684af12cf15' }
      const state = {
        ...initialState,
        loading: false,
        wbClientUuid: data.uuid,
      }

      // Act
      const nextState = reducer(initialState, processWBClientSuccess(data?.uuid))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        workbench: {
          settings: nextState,
        },
      })
      expect(workbenchSettingsSelector(rootState)).toEqual(state)
    })

    it('should properly set the state with empty data', () => {
      // Arrange
      const data = { uuid: '' }

      const state = {
        ...initialState,
        loading: false,
        wbClientUuid: data.uuid,
      }

      // Act
      const nextState = reducer(initialState, processWBClientSuccess(data?.uuid))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        workbench: {
          settings: nextState,
        },
      })
      expect(workbenchSettingsSelector(rootState)).toEqual(state)
    })
  })

  describe('processWBClientFailure', () => {
    it('should properly set the error', () => {
      // Arrange
      const data = 'some error'
      const state = {
        ...initialState,
        loading: false,
        errorClient: data,
      }

      // Act
      const nextState = reducer(initialState, processWBClientFailure(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        workbench: {
          settings: nextState,
        },
      })
      expect(workbenchSettingsSelector(rootState)).toEqual(state)
    })
  })

  describe('thunks', () => {
    it('call both createWBClientAction and processWBClientSuccess when fetch is successed', async () => {
      // Arrange
      const data = { uuid: '70b95d32-c19d-4311-bb24-e684af12cf15' }
      const responsePayload = { data, status: 200 }

      apiService.post = jest.fn().mockResolvedValue(responsePayload)

      // Act
      await store.dispatch<any>(createWBClientAction())

      // Assert
      const expectedActions = [
        processWBClient(),
        processWBClientSuccess(responsePayload.data?.uuid),
      ]
      expect(store.getActions()).toEqual(expectedActions)
    })

    it('call both createWBClientAction and processWBClientFailure when fetch is fail', async () => {
      // Arrange
      const errorMessage = 'Could not connect to aoeu:123, please check the connection details.'
      const responsePayload = {
        response: {
          status: 500,
          data: { message: errorMessage },
        },
      }

      apiService.post = jest.fn().mockRejectedValueOnce(responsePayload)

      // Act
      await store.dispatch<any>(createWBClientAction())

      // Assert
      const expectedActions = [
        processWBClient(),
        processWBClientFailure(responsePayload.response.data.message),
      ]
      expect(store.getActions()).toEqual(expectedActions)
    })

    it('call both updateWBClientAction and processWBClientSuccess when fetch is successed', async () => {
      // Arrange
      const instanceId = '123'
      const uuid = '70b95d32-c19d-4311-bb24-e684af12cf15'
      const data = { uuid }
      const responsePayload = { data, status: 200 }

      apiService.patch = jest.fn().mockResolvedValue(responsePayload)

      // Act
      await store.dispatch<any>(updateWBClientAction(instanceId, uuid))

      // Assert
      const expectedActions = [
        processWBClient(),
        processWBClientSuccess(responsePayload.data?.uuid),
      ]
      expect(store.getActions()).toEqual(expectedActions)
    })

    it('call both updateWBClientAction and processWBClientFailure when fetch is fail', async () => {
      // Arrange
      const instanceId = '123'
      const uuid = '70b95d32-c19d-4311-bb24-e684af12cf15'
      const errorMessage = 'Could not connect to aoeu:123, please check the connection details.'
      const responsePayload = {
        response: {
          status: 500,
          data: { message: errorMessage },
        },
      }

      apiService.patch = jest.fn().mockRejectedValueOnce(responsePayload)

      // Act
      await store.dispatch<any>(updateWBClientAction(instanceId, uuid))

      // Assert
      const expectedActions = [
        processWBClient(),
        processWBClientFailure(responsePayload.response.data.message),
      ]
      expect(store.getActions()).toEqual(expectedActions)
    })
  })
})
