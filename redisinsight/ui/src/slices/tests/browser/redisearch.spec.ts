import { AxiosError } from 'axios'
import { cloneDeep, omit } from 'lodash'
import successMessages from 'uiSrc/components/notifications/success-messages'
import { apiService } from 'uiSrc/services'
import { cleanup, initialStateDefault, mockedStore } from 'uiSrc/utils/test-utils'
import { addErrorNotification, addMessageNotification } from 'uiSrc/slices/app/notifications'
import { stringToBuffer } from 'uiSrc/utils'
import { REDISEARCH_LIST_DATA_MOCK } from 'uiSrc/mocks/handlers/browser/redisearchHandlers'
import { SearchMode } from 'uiSrc/slices/interfaces/keys'
import { fetchKeys, fetchMoreKeys } from 'uiSrc/slices/browser/keys'
import reducer, {
  initialState,
  loadKeys,
  loadKeysSuccess,
  loadKeysFailure,
  loadMoreKeys,
  loadMoreKeysSuccess,
  loadMoreKeysFailure,
  loadList,
  loadListSuccess,
  loadListFailure,
  setSelectedIndex,
  setLastBatchRedisearchKeys,
  setQueryRedisearch,
  createIndex,
  createIndexSuccess,
  createIndexFailure,
  fetchRedisearchListAction,
  createRedisearchIndexAction,
  redisearchDataSelector,
  redisearchSelector,
} from '../../browser/redisearch'

let store: typeof mockedStore
let dateNow: jest.SpyInstance<number>
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

jest.mock('uiSrc/services', () => ({
  ...jest.requireActual('uiSrc/services'),
}))

describe('redisearch slice', () => {
  beforeAll(() => {
    dateNow = jest.spyOn(Date, 'now').mockImplementation(() => 1629128049027)
  })

  afterAll(() => {
    dateNow.mockRestore()
  })

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

  describe('loadKeys', () => {
    it('should properly set the state before the fetch data', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
      }

      // Act
      const nextState = reducer(initialState, loadKeys())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: {
          redisearch: nextState,
        },
      })
      expect(redisearchSelector(rootState)).toEqual(state)
      expect(redisearchDataSelector(rootState)).toEqual(state.data)
    })
  })

  describe('loadKeysSuccess', () => {
    it('should properly set the state with fetched data', () => {
      // Arrange
      const data = {
        total: 249,
        cursor: 228,
        scanned: 228,
        keys: [
          {
            name: stringToBuffer('bull:mail-queue:155'),
            type: 'hash',
            ttl: 2147474450,
            size: 3041,
          },
          {
            name: stringToBuffer('bull:mail-queue:223'),
            type: 'hash',
            ttl: -1,
            size: 3041,
          },
        ],
      }

      const state = {
        ...initialState,
        loading: false,
        error: '',
        data: {
          ...data,
          shardsMeta: {},
          nextCursor: '228',
          lastRefreshTime: Date.now(),
          previousResultCount: data.keys.length,
        },
      }

      // Act
      const nextState = reducer(
        initialState,
        loadKeysSuccess(data)
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { redisearch: nextState },
      })
      expect(redisearchSelector(rootState)).toEqual(state)
    })
  })

  describe('loadKeysFailure', () => {
    it('should properly set the error', () => {
      // Arrange
      const data = 'some error'
      const state = {
        ...initialState,
        loading: false,
        error: data,
        data: {
          ...initialState.data,
          keys: [],
          nextCursor: '0',
          total: 0,
          scanned: 0,
          shardsMeta: {},
          previousResultCount: 0,
        },
      }

      // Act
      const nextState = reducer(initialState, loadKeysFailure(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { redisearch: nextState },
      })
      expect(redisearchSelector(rootState)).toEqual(state)
    })
  })

  describe('loadMoreKeys', () => {
    it('should properly set the state before the fetch data', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
        error: '',
        data: {
          ...initialState.data,
          keys: [],
          nextCursor: '0',
          total: 0,
          scanned: 0,
          shardsMeta: {},
          previousResultCount: 0,
        },
      }

      // Act
      const nextState = reducer(initialState, loadMoreKeys())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { redisearch: nextState },
      })
      expect(redisearchSelector(rootState)).toEqual(state)
    })
  })

  describe('loadMoreKeysSuccess', () => {
    it('should properly set the state with fetched data', () => {
      // Arrange

      const data = {
        total: 0,
        cursor: 0,
        shardsMeta: {},
        scanned: 0,
        keys: [
          {
            name: stringToBuffer('bull:mail-queue:155'),
            type: 'hash',
            ttl: 2147474450,
            size: 3041,
          },
          {
            name: stringToBuffer('bull:mail-queue:223'),
            type: 'hash',
            ttl: -1,
            size: 3041,
          },
        ],
      }

      const state = {
        ...initialState,
        loading: false,
        error: '',
        data: {
          ...omit(data, 'cursor'),
          nextCursor: `${data.cursor}`,
          previousResultCount: data.keys.length,
          lastRefreshTime: initialState.data.lastRefreshTime
        },
      }

      // Act
      const nextState = reducer(initialState, loadMoreKeysSuccess(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { redisearch: nextState },
      })
      expect(redisearchSelector(rootState)).toEqual(state)
    })

    it('should properly set the state with empty data', () => {
      // Arrange
      const data = {
        total: 0,
        cursor: '0',
        keys: [],
        scanned: 0,
        shardsMeta: {},
      }

      // Act
      const nextState = reducer(initialState, loadMoreKeysSuccess(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { redisearch: nextState },
      })
      expect(redisearchSelector(rootState)).toEqual(initialState)
    })
  })

  describe('loadMoreKeysFailure', () => {
    it('should properly set the error', () => {
      // Arrange
      const data = 'some error'
      const state = {
        ...initialState,
        loading: false,
        error: data,
        data: {
          ...initialState.data,
          keys: [],
          nextCursor: '0',
          total: 0,
          scanned: 0,
          shardsMeta: {},
          previousResultCount: 0,
        },
      }

      // Act
      const nextState = reducer(initialState, loadMoreKeysFailure(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { redisearch: nextState },
      })
      expect(redisearchSelector(rootState)).toEqual(state)
    })
  })

  describe('loadList', () => {
    it('should properly set the state before the fetch data', () => {
      // Arrange
      const state = {
        ...initialState,
        list: {
          ...initialState.list,
          loading: true,
        }
      }

      // Act
      const nextState = reducer(initialState, loadList())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: {
          redisearch: nextState,
        },
      })
      expect(redisearchSelector(rootState)).toEqual(state)
      expect(redisearchDataSelector(rootState)).toEqual(state.data)
    })
  })

  describe('loadListSuccess', () => {
    it('should properly set the state with fetched data', () => {
      // Arrange
      const data = REDISEARCH_LIST_DATA_MOCK
      const state = {
        ...initialState,
        list: {
          data,
          error: '',
          loading: false,
        }
      }

      // Act
      const nextState = reducer(initialState, loadListSuccess(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: {
          redisearch: nextState,
        },
      })
      expect(redisearchSelector(rootState)).toEqual(state)
      expect(redisearchDataSelector(rootState)).toEqual(state.data)
    })

    it('should properly set the state with empty data', () => {
      // Arrange
      const data: any[] = []

      const state = {
        ...initialState,
        list: {
          data,
          error: '',
          loading: false,
        }
      }

      // Act
      const nextState = reducer(initialState, loadListSuccess(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: {
          redisearch: nextState,
        },
      })
      expect(redisearchSelector(rootState)).toEqual(state)
      expect(redisearchDataSelector(rootState)).toEqual(state.data)
    })
  })

  describe('loadListFailure', () => {
    it('should properly set the error', () => {
      // Arrange
      const data = 'some error'
      const state = {
        ...initialState,
        list: {
          data: [],
          loading: false,
          error: data,
        }
      }

      // Act
      const nextState = reducer(initialState, loadListFailure(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: {
          redisearch: nextState,
        },
      })
      expect(redisearchSelector(rootState)).toEqual(state)
      expect(redisearchDataSelector(rootState)).toEqual(state.data)
    })
  })

  describe('setSelectedIndex', () => {
    it('should properly set the selected index', () => {
      // Arrange

      const index = stringToBuffer('idx')
      const state = {
        ...initialState,
        selectedIndex: index,
      }

      // Act
      const nextState = reducer(initialState, setSelectedIndex(index))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { redisearch: nextState },
      })
      expect(redisearchSelector(rootState)).toEqual(state)
    })
  })

  describe('setQueryRedisearch', () => {
    it('should properly set the selected index', () => {
      // Arrange

      const query = 'query'
      const state = {
        ...initialState,
        search: query,
      }

      // Act
      const nextState = reducer(initialState, setQueryRedisearch(query))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { redisearch: nextState },
      })
      expect(redisearchSelector(rootState)).toEqual(state)
    })
  })

  describe('setLastBatchKeys', () => {
    it('should properly set the state', () => {
      // Arrange
      const strToKey = (name:string) => ({ name, nameString: name, ttl: 1, size: 1, type: 'hash' })
      const data = ['44', '55', '66'].map(strToKey)

      const state = {
        ...initialState,
        data: {
          ...initialState.data,
          keys: ['1', '2', '3', '44', '55', '66'].map(strToKey),
        }
      }

      const prevState = {
        ...initialState,
        data: {
          ...initialState.data,
          keys: ['1', '2', '3', '4', '5', '6'].map(strToKey),
        }
      }

      // Act
      const nextState = reducer(prevState, setLastBatchRedisearchKeys(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { redisearch: nextState },
      })
      expect(redisearchSelector(rootState)).toEqual(state)
    })
  })

  describe('createIndex', () => {
    it('should properly set the state before the fetch data', () => {
      // Arrange
      const state = {
        ...initialState,
        createIndex: {
          ...initialState.createIndex,
          loading: true,
          error: ''
        }
      }

      // Act
      const nextState = reducer(initialState, createIndex())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: {
          redisearch: nextState,
        },
      })
      expect(redisearchSelector(rootState)).toEqual(state)
    })
  })

  describe('createIndexSuccess', () => {
    it('should properly set the state', () => {
      // Arrange
      const state = {
        ...initialState,
        createIndex: {
          ...initialState.createIndex,
          loading: false,
        }
      }

      // Act
      const nextState = reducer(
        initialState,
        createIndexSuccess()
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { redisearch: nextState },
      })
      expect(redisearchSelector(rootState)).toEqual(state)
    })
  })

  describe('loadKeysFailure', () => {
    it('should properly set the error', () => {
      // Arrange
      const data = 'some error'
      const state = {
        ...initialState,
        createIndex: {
          ...initialState.createIndex,
          loading: false,
          error: data
        }
      }

      // Act
      const nextState = reducer(initialState, createIndexFailure(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { redisearch: nextState },
      })
      expect(redisearchSelector(rootState)).toEqual(state)
    })
  })

  describe('thunks', () => {
    describe('fetchRedisearchListAction', () => {
      it('call both fetchRedisearchListAction, loadListSuccess when fetch is successed', async () => {
        // Arrange
        const data = REDISEARCH_LIST_DATA_MOCK
        const responsePayload = { data, status: 200 }

        apiService.get = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchRedisearchListAction())

        // Assert
        const expectedActions = [
          loadList(),
          loadListSuccess(responsePayload.data.indexes),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('fetchRedisearchKeysAction', () => {
      it('call both loadKeys and loadKeysSuccess when fetch is successed', async () => {
      // Arrange
        const data = {
          total: 10,
          cursor: 20,
          scanned: 20,
          keys: [
            {
              name: stringToBuffer('bull:mail-queue:155'),
              type: 'hash',
              ttl: 2147474450,
              size: 3041,
            },
            {
              name: stringToBuffer('bull:mail-queue:223'),
              type: 'hash',
              ttl: -1,
              size: 3041,
            },
          ],
        }
        const responsePayload = {
          data: {
            total: data.total,
            scanned: data.scanned,
            cursor: 20,
            keys: [...data.keys],
          },
          status: 200,
        }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchKeys(SearchMode.Redisearch, '0', 20))

        // Assert
        const expectedActions = [
          loadKeys(),
          loadKeysSuccess(data),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })

      it('failed to load keys', async () => {
        // Arrange
        const errorMessage = 'some error'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.post = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchKeys(SearchMode.Redisearch, '0', 20))

        // Assert
        const expectedActions = [
          loadKeys(),
          addErrorNotification(responsePayload as AxiosError),
          loadKeysFailure(errorMessage),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('fetchMoreRedisearchKeysAction', () => {
      it('call both loadMoreKeys and loadMoreKeysSuccess when fetch is successed', async () => {
        // Arrange
        const data = {
          total: 0,
          nextCursor: '0',
          scanned: 20,
          shardsMeta: {},
          keys: [
            {
              name: stringToBuffer('bull:mail-queue:155'),
              type: 'hash',
              ttl: 2147474450,
              size: 3041,
            },
            {
              name: stringToBuffer('bull:mail-queue:223'),
              type: 'hash',
              ttl: -1,
              size: 3041,
            },
          ],
        }

        const responsePayload = {
          data: {
            total: data.total,
            scanned: data.scanned,
            cursor: 20,
            keys: [...data.keys],
          },
          status: 200,
        }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchMoreKeys(SearchMode.Redisearch, [], '0', 20))

        // Assert
        const expectedActions = [
          loadMoreKeys(),
          loadMoreKeysSuccess(responsePayload.data),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })

      it('failed to fetch more keys', async () => {
        // Arrange
        const errorMessage = 'some error'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.post = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchMoreKeys(SearchMode.Redisearch, [], '0', 20))

        // Assert
        const expectedActions = [
          loadMoreKeys(),
          addErrorNotification(responsePayload as AxiosError),
          loadMoreKeysFailure(errorMessage),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('createRedisearchIndexAction', () => {
      it('should call proper actions on success', async () => {
        // Arrange
        const data = {
          index: stringToBuffer('index'),
          type: 'hash',
          prefixes: ['prefix1', 'prefix 2'].map((p) => stringToBuffer(p)),
          fields: [{ name: stringToBuffer('field'), type: 'numeric' }]
        }

        const responsePayload = { status: 200 }
        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(createRedisearchIndexAction(data))

        // Assert
        const expectedActions = [
          createIndex(),
          createIndexSuccess(),
          addMessageNotification(successMessages.CREATE_INDEX()),
          loadList()
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })

      it('failed to create index', async () => {
        // Arrange
        const errorMessage = 'some error'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.post = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(createRedisearchIndexAction({}))

        // Assert
        const expectedActions = [
          createIndex(),
          addErrorNotification(responsePayload as AxiosError),
          createIndexFailure(errorMessage),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })
  })
})
