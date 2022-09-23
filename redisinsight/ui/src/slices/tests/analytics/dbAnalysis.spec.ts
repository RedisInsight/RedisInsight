import { AxiosError } from 'axios'
import { cloneDeep } from 'lodash'
import { apiService } from 'uiSrc/services'
import { addErrorNotification } from 'uiSrc/slices/app/notifications'
import reducer, {
  initialState,
  addNewAnalysis,
  setDatabaseAnalysisInitialState,
  getDBAnalysisReport,
  getDBAnalysisReportSuccess,
  getDBAnalysisReportError,
  loadDBAnalysisReport,
  loadDBAnalysisReportSuccess,
  loadDBAnalysisReportError,
  setSelectedAnalysis,
  fetchDBAnalysisReportAction,
  createNewAnalysis,
  fetchDBAnalysisReportsHistory,
  DBAnalysisReportsSelector,
  DBAnalysis
} from 'uiSrc/slices/analytics/dbAnalysis'
import { cleanup, initialStateDefault, mockedStore } from 'uiSrc/utils/test-utils'

let store: typeof mockedStore

const mockAnalysis = {
  id: '071ce08e-00b5-4356-b261-b666f4fbbbd9',
  databaseId: '528332fb-3fad-4392-a1e3-8eb919a76680',
  filter: { type: null, match: '*', count: 10000 },
  delimiter: ':',
  progress: { total: 14209, scanned: 80000, processed: 14209 },
  createdAt: new Date('2021-04-22T09:03:56.917Z'),
  totalKeys: {
    total: 14209,
    types: [{ type: 'zset', total: 1 }]
  },
  totalMemory: {
    total: 1026830,
    types: [{ type: 'zset', total: 96 }]
  },
  topKeysNsp: [{
    nsp: 'delimiter_4',
    memory: 1399,
    keys: 7,
    types: [{ type: 'zset', memory: 96, keys: 1 }]
  }],
  topMemoryNsp: [{
    nsp: 'delimiter_3',
    memory: 114768,
    keys: 1,
    types: [{ type: 'string', memory: 114768, keys: 1 }]
  }],
  topKeysMemory: [{
    name: 'delimiter_3:big',
    type: 'string',
    memory: 114768,
    length: 100331,
    ttl: -1
  }]
}

const mockHistoryReport = {
  id: 'id',
  created: new Date('2021-04-22T09:03:56.917Z')
}

beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('pubsub slice', () => {
  describe('reducer, actions and selectors', () => {
    it('should return the initial state on first run', () => {
      // Arrange
      const nextState = initialState

      // Act
      const result = reducer(undefined, {})

      // Assert
      expect(result).toEqual(nextState)
    })

    describe('setDatabaseAnalysisInitialState', () => {
      it('should properly set initial state', () => {
        const nextState = reducer(initialState, setDatabaseAnalysisInitialState())
        const rootState = Object.assign(initialStateDefault, {
          analytics: { databaseAnalysis: nextState },
        })
        expect(DBAnalysis(rootState)).toEqual(initialState)
      })
    })

    describe('setSelectedAnalysis', () => {
      it('should properly set payload to selectedAnalysis', () => {
        const payload = 'id'

        // Arrange
        const stateHistory = {
          ...initialState.history,
          selectedAnalysis: 'id'
        }

        // Act
        const nextState = reducer(initialState, setSelectedAnalysis(payload))

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          analytics: { databaseAnalysis: nextState },
        })
        expect(DBAnalysisReportsSelector(rootState)).toEqual(stateHistory)
      })
    })
    describe('addNewAnalysis', () => {
      it('should properly set new analysis report', () => {
        const payload = mockHistoryReport

        // Arrange
        const stateHistory = {
          ...initialState.history,
          data: [{ id: 'id', created: new Date('2021-04-22T09:03:56.917Z') }]
        }

        // Act
        const nextState = reducer(initialState, addNewAnalysis(payload))

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          analytics: { databaseAnalysis: nextState },
        })
        expect(DBAnalysisReportsSelector(rootState)).toEqual(stateHistory)
      })
      it('should properly add new analysis report to existing state history', () => {
        const payload = mockHistoryReport

        const startState = {
          ...initialState,
          history: {
            ...initialState.history,
            data: null
          }
        }

        // Arrange
        const state = {
          ...initialState,
          history: {
            ...initialState.history,
            data: [
              { id: 'id', created: new Date('2021-04-22T09:03:56.917Z') }
            ]
          }
        }

        // Act
        const nextState = reducer({
          ...startState,
        }, addNewAnalysis(payload))

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          analytics: { databaseAnalysis: nextState }
        })
        expect(DBAnalysis(rootState)).toEqual(state)
      })
    })
    describe('loadDBAnalysisReportError', () => {
      it('should properly set error to history', () => {
        // Arrange
        const error = 'Some error'
        const state = {
          ...initialState,
          history: {
            loading: false,
            error,
            data: [],
            selectedAnalysis: null
          }
        }

        // Act
        const nextState = reducer(initialState, loadDBAnalysisReportError(error))

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          analytics: { databaseAnalysis: nextState },
        })
        expect(DBAnalysis(rootState)).toEqual(state)
      })
    })
    describe('getDBAnalysisReportError', () => {
      it('should properly set error', () => {
        // Arrange
        const error = 'Some error'
        const state = {
          ...initialState,
          error,
          loading: false,
        }

        // Act
        const nextState = reducer(initialState, getDBAnalysisReportError(error))

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          analytics: { databaseAnalysis: nextState },
        })
        expect(DBAnalysis(rootState)).toEqual(state)
      })
    })
    describe('getDBAnalysisReport', () => {
      it('should properly set loading: true', () => {
        // Arrange
        const state = {
          ...initialState,
          loading: true,
        }

        // Act
        const nextState = reducer(initialState, getDBAnalysisReport())

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          analytics: { databaseAnalysis: nextState },
        })
        expect(DBAnalysis(rootState)).toEqual(state)
      })
    })
    describe('loadDBAnalysisReport', () => {
      it('should properly set loading: true', () => {
        // Arrange
        const state = {
          ...initialState,
          history: {
            ...initialState.history,
            loading: true
          }
        }

        // Act
        const nextState = reducer(initialState, loadDBAnalysisReport())

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          analytics: { databaseAnalysis: nextState },
        })
        expect(DBAnalysis(rootState)).toEqual(state)
      })
    })
    describe('getDBAnalysisReportSuccess', () => {
      it('should properly set loading: true', () => {
        const payload = mockAnalysis
        // Arrange
        const state = {
          ...initialState,
          loading: false,
          data: mockAnalysis
        }

        // Act
        const nextState = reducer(initialState, getDBAnalysisReportSuccess(payload))

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          analytics: { databaseAnalysis: nextState },
        })
        expect(DBAnalysis(rootState)).toEqual(state)
      })
    })
    describe('loadDBAnalysisReportSuccess', () => {
      it('should properly set data to history', () => {
        const payload = [mockHistoryReport]
        // Arrange
        const stateHistory = {
          ...initialState.history,
          loading: false,
          data: [{ id: 'id', created: new Date('2021-04-22T09:03:56.917Z') }]
        }

        // Act
        const nextState = reducer(initialState, loadDBAnalysisReportSuccess(payload))

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          analytics: { databaseAnalysis: nextState },
        })
        expect(DBAnalysisReportsSelector(rootState)).toEqual(stateHistory)
      })
    })
  })

  // thunks
  describe('thunks', () => {
    describe('fetchDBAnalysisReportAction', () => {
      it('succeed to fetch analysis data', async () => {
        const data = mockAnalysis
        const responsePayload = { data, status: 200 }

        apiService.get = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(
          fetchDBAnalysisReportAction('instanceId', 'id')
        )

        // Assert
        const expectedActions = [
          getDBAnalysisReport(),
          getDBAnalysisReportSuccess(data),
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
          fetchDBAnalysisReportAction('instanceId', 'id')
        )

        // Assert
        const expectedActions = [
          getDBAnalysisReport(),
          addErrorNotification(responsePayload as AxiosError),
          getDBAnalysisReportError(errorMessage)
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })
    describe('createNewAnalysis', () => {
      it('succeed to create new analysis', async () => {
        const data = mockAnalysis
        const responsePayload = { data, status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(
          createNewAnalysis('instanceId', 'delimiter')
        )

        // Assert
        const expectedActions = [
          getDBAnalysisReport(),
          getDBAnalysisReportSuccess(data),
          addNewAnalysis({ id: data.id, createdAt: data.createdAt }),
          setSelectedAnalysis(data.id)
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })

      it('failed to create new analysis', async () => {
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
          createNewAnalysis('instanceId', 'delimiter')
        )

        // Assert
        const expectedActions = [
          getDBAnalysisReport(),
          addErrorNotification(responsePayload as AxiosError),
          getDBAnalysisReportError(errorMessage)
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })
    describe('fetchDBAnalysisReportsHistory', () => {
      it('succeed to fetch analysis reports', async () => {
        const data = [mockHistoryReport]
        const responsePayload = { data, status: 200 }

        apiService.get = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(
          fetchDBAnalysisReportsHistory('instanceId')
        )

        // Assert
        const expectedActions = [
          loadDBAnalysisReport(),
          loadDBAnalysisReportSuccess(data),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })

      it('failed to create new analysis', async () => {
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
          fetchDBAnalysisReportsHistory('instanceId')
        )

        // Assert
        const expectedActions = [
          loadDBAnalysisReport(),
          addErrorNotification(responsePayload as AxiosError),
          loadDBAnalysisReportError(errorMessage)
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })
  })
})
