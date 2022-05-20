import { AxiosError } from 'axios'
import { cloneDeep } from 'lodash'
import { DEFAULT_SLOWLOG_DURATION_UNIT, SortOrder } from 'uiSrc/constants'
import { apiService } from 'uiSrc/services'
import reducer, {
  addNewEntries,
  addNewEntriesFailure,
  addNewEntriesSuccess,
  cleanRangeFilter,
  fetchStreamEntries,
  initialState,
  loadEntries,
  loadEntriesFailure,
  loadEntriesSuccess,
  loadMoreEntries,
  loadMoreEntriesFailure,
  loadMoreEntriesSuccess, refreshStreamEntries,
  removeEntriesFromList,
  removeStreamEntries,
  removeStreamEntriesFailure,
  removeStreamEntriesSuccess,
  streamRangeSelector,
  streamSelector,
  updateEnd,
  updateStart
} from 'uiSrc/slices/browser/stream'
import { fetchSlowLogsAction, getSlowLogs, getSlowLogsError, getSlowLogsSuccess } from 'uiSrc/slices/slowlog/slowlog'
import { cleanup, initialStateDefault, mockedStore, } from 'uiSrc/utils/test-utils'
import { addErrorNotification } from '../../app/notifications'

jest.mock('uiSrc/services')

let store: typeof mockedStore

const mockedData = {
  keyName: 'stream_example',
  total: 1,
  lastGeneratedId: '1652942518810-0',
  firstEntry: {
    id: '1652942518810-0',
    fields: { 1: '2' }
  },
  lastEntry: {
    id: '1652942518810-0',
    fields: { 1: '2' }
  },
  entries: [{
    id: '1652942518810-0',
    fields: { 1: '2' }
  }]
}

beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('stream slice', () => {
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

  describe('loadEntries', () => {
    it('should properly set the state before the fetch data', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
      }

      // Act
      const nextState = reducer(initialState, loadEntries(true))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { stream: nextState },
      })
      expect(streamSelector(rootState)).toEqual(state)
    })
  })

  describe('loadEntriesSuccess', () => {
    it('should properly set the state with fetched data', () => {
      // Arrange

      const state = {
        ...initialState,
        loading: false,
        error: '',
        data: {
          ...mockedData,
        },
      }

      // Act
      const nextState = reducer(initialState, loadEntriesSuccess([mockedData, SortOrder.DESC]))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { stream: nextState },
      })
      expect(streamSelector(rootState)).toEqual(state)
    })
  })

  describe('loadEntriesFailure', () => {
    it('should properly set the state after failed fetched data', () => {
      // Arrange
      const error = 'Some error'
      const state = {
        ...initialState,
        loading: false,
        error,
      }

      // Act
      const nextState = reducer(initialState, loadEntriesFailure(error))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { stream: nextState },
      })
      expect(streamSelector(rootState)).toEqual(state)
    })
  })

  describe('loadMoreEntries', () => {
    it('should properly set the state before the fetch data', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
      }

      // Act
      const nextState = reducer(initialState, loadMoreEntries(true))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { stream: nextState },
      })
      expect(streamSelector(rootState)).toEqual(state)
    })
  })

  describe('loadMoreEntriesSuccess', () => {
    it('should properly set the state with fetched data', () => {
      // Arrange

      const state = {
        ...initialState,
        loading: false,
        error: '',
        data: {
          ...mockedData,
        },
      }

      // Act
      const nextState = reducer(initialState, loadMoreEntriesSuccess(mockedData))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { stream: nextState },
      })
      expect(streamSelector(rootState)).toEqual(state)
    })
  })

  describe('loadMoreEntriesFailure', () => {
    it('should properly set the state after failed fetched data', () => {
      // Arrange
      const error = 'Some error'
      const state = {
        ...initialState,
        loading: false,
        error,
      }

      // Act
      const nextState = reducer(initialState, loadMoreEntriesFailure(error))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { stream: nextState },
      })
      expect(streamSelector(rootState)).toEqual(state)
    })
  })

  describe('addNewEntries', () => {
    it('should properly set the state before the fetch data', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
      }

      // Act
      const nextState = reducer(initialState, addNewEntries())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { stream: nextState },
      })
      expect(streamSelector(rootState)).toEqual(state)
    })
  })

  describe('addNewEntriesSuccess', () => {
    it('should properly set the state with fetched data', () => {
      // Arrange

      const state = {
        ...initialState,
        loading: false
      }

      // Act
      const nextState = reducer(initialState, addNewEntriesSuccess())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { stream: nextState },
      })
      expect(streamSelector(rootState)).toEqual(state)
    })
  })

  describe('addNewEntriesFailure', () => {
    it('should properly set the state after failed fetched data', () => {
      // Arrange
      const error = 'Some error'
      const state = {
        ...initialState,
        loading: false,
        error,
      }

      // Act
      const nextState = reducer(initialState, addNewEntriesFailure(error))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { stream: nextState },
      })
      expect(streamSelector(rootState)).toEqual(state)
    })
  })

  describe('removeStreamEntries', () => {
    it('should properly set the state before the fetch data', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
      }

      // Act
      const nextState = reducer(initialState, removeStreamEntries())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { stream: nextState },
      })
      expect(streamSelector(rootState)).toEqual(state)
    })
  })

  describe('removeStreamEntriesSuccess', () => {
    it('should properly set the state with fetched data', () => {
      // Arrange

      const state = {
        ...initialState,
        loading: false
      }

      // Act
      const nextState = reducer(initialState, removeStreamEntriesSuccess())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { stream: nextState },
      })
      expect(streamSelector(rootState)).toEqual(state)
    })
  })

  describe('removeStreamEntriesFailure', () => {
    it('should properly set the state after failed fetched data', () => {
      // Arrange
      const error = 'Some error'
      const state = {
        ...initialState,
        loading: false,
        error,
      }

      // Act
      const nextState = reducer(initialState, removeStreamEntriesFailure(error))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { stream: nextState },
      })
      expect(streamSelector(rootState)).toEqual(state)
    })
  })

  describe('removeEntriesFromList', () => {
    it('should properly remove entries from list', () => {
      // Arrange
      const startState = {
        ...initialState,
        data: {
          ...mockedData
        }
      }

      const endState = {
        ...initialState,
        loading: false,
        data: {
          ...mockedData,
          entries: [],
          total: 0
        }
      }

      // Act
      const nextState = reducer(startState, removeEntriesFromList([mockedData.entries[0].id]))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { stream: nextState },
      })
      expect(streamSelector(rootState)).toEqual(endState)
    })
  })

  describe('updateStart', () => {
    it('should properly set the state', () => {
      // Arrange
      const state = {
        ...initialState,
        range: {
          ...initialState.range,
          start: '10'
        }
      }

      // Act
      const nextState = reducer(initialState, updateStart('10'))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { stream: nextState },
      })
      expect(streamSelector(rootState)).toEqual(state)
    })
  })

  describe('updateEnd', () => {
    it('should properly set the state', () => {
      // Arrange
      const state = {
        ...initialState,
        range: {
          ...initialState.range,
          end: '100'
        }
      }

      // Act
      const nextState = reducer(initialState, updateEnd('100'))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { stream: nextState },
      })
      expect(streamSelector(rootState)).toEqual(state)
    })
  })

  describe('cleanRangeFilter', () => {
    it('should properly set the state', () => {
      // Arrange
      const startState = {
        ...initialState,
        range: {
          ...initialState.range,
          start: '100',
          end: '200'
        }
      }
      const stateRange = {
        ...initialState.range
      }

      // Act
      const nextState = reducer(startState, cleanRangeFilter())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { stream: nextState },
      })
      expect(streamRangeSelector(rootState)).toEqual(stateRange)
    })
  })

  describe('thunks', () => {
    describe('fetchStreamEntries', () => {
      it('succeed to fetch data', async () => {
        // Arrange
        const responsePayload = { data: mockedData, status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchStreamEntries(
          mockedData.keyName,
          500,
          SortOrder.DESC,
          true
        ))

        // Assert
        const expectedActions = [
          loadEntries(true),
          loadEntriesSuccess([mockedData, SortOrder.DESC]),
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
        await store.dispatch<any>(fetchStreamEntries(
          mockedData.keyName,
          500,
          SortOrder.DESC,
          true
        ))

        // Assert
        const expectedActions = [
          loadEntries(true),
          addErrorNotification(responsePayload as AxiosError),
          loadEntriesFailure(errorMessage)
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('refreshStreamEntries', () => {
      it('succeed to fetch data', async () => {
        // Arrange
        const responsePayload = { data: mockedData, status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(refreshStreamEntries(
          mockedData.keyName,
          true
        ))

        // Assert
        const expectedActions = [
          loadEntries(true),
          loadEntriesSuccess([mockedData, SortOrder.DESC]),
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
        await store.dispatch<any>(refreshStreamEntries(
          mockedData.keyName,
          true
        ))

        // Assert
        const expectedActions = [
          loadEntries(true),
          addErrorNotification(responsePayload as AxiosError),
          loadEntriesFailure(errorMessage)
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })
  })
})
