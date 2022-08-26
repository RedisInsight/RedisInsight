import { cloneDeep } from 'lodash'
import { AxiosError } from 'axios'
import { KeyTypes } from 'uiSrc/constants'
import { apiService } from 'uiSrc/services'
import { parseKeysListResponse, stringToBuffer } from 'uiSrc/utils'
import { cleanup, initialStateDefault, mockedStore } from 'uiSrc/utils/test-utils'
import { addErrorNotification, addMessageNotification } from 'uiSrc/slices/app/notifications'
import successMessages from 'uiSrc/components/notifications/success-messages'
import {
  CreateHashWithExpireDto,
  CreateListWithExpireDto,
  CreateRejsonRlWithExpireDto,
  CreateSetWithExpireDto,
  CreateZSetWithExpireDto,
  ListElementDestination,
  SetStringWithExpireDto,
} from 'apiSrc/modules/browser/dto'
import reducer, {
  initialState,
  loadKeys,
  loadKeysSuccess,
  loadKeysFailure,
  loadMoreKeys,
  loadMoreKeysSuccess,
  loadMoreKeysFailure,
  keysSelector,
  fetchKeys,
  fetchMoreKeys,
  defaultSelectedKeyAction,
  loadKeyInfoSuccess,
  fetchKeyInfo,
  refreshKeyInfo,
  refreshKeyInfoSuccess,
  refreshKeyInfoFail,
  refreshKeyInfoAction,
  addKey,
  addKeySuccess,
  addKeyFailure,
  resetAddKey,
  deleteKeyAction,
  deleteKey,
  deleteKeySuccess,
  deleteKeyFailure,
  deleteKeyFromList,
  editKeyFromList,
  defaultSelectedKeyActionSuccess,
  editKey,
  defaultSelectedKeyActionFailure,
  editKeyTTL,
  editKeyTTLFromList,
  addHashKey,
  addSetKey,
  addReJSONKey,
  addListKey,
  addStringKey,
  addZsetKey,
  updateSelectedKeyRefreshTime,
} from '../../browser/keys'
import { getString } from '../../browser/string'

jest.mock('uiSrc/services', () => ({
  ...jest.requireActual('uiSrc/services'),
}))

let store: typeof mockedStore
let dateNow: jest.SpyInstance<number>
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('keys slice', () => {
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
        browser: { keys: nextState },
      })
      expect(keysSelector(rootState)).toEqual(state)
    })
  })

  describe('loadKeysSuccess', () => {
    it('should properly set the state with fetched data', () => {
      // Arrange

      const data = {
        total: 249,
        nextCursor: '228',
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
          lastRefreshTime: Date.now(),
          previousResultCount: data.keys.length,
        },
      }

      // Act
      const nextState = reducer(
        initialState,
        loadKeysSuccess({ data, isFiltered: false, isSearched: false })
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { keys: nextState },
      })
      expect(keysSelector(rootState)).toEqual(state)
    })

    it('should properly set the state with empty data', () => {
      // Arrange
      const data: any = {}

      const state = {
        ...initialState,
        loading: false,
        error: '',
        data: {
          ...data,
          previousResultCount: data.keys?.length,
          lastRefreshTime: Date.now(),
        },
      }

      // Act
      const nextState = reducer(
        initialState,
        loadKeysSuccess({ data, isFiltered: false, isSearched: false })
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { keys: nextState },
      })
      expect(keysSelector(rootState)).toEqual(state)
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
        browser: { keys: nextState },
      })
      expect(keysSelector(rootState)).toEqual(state)
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
        browser: { keys: nextState },
      })
      expect(keysSelector(rootState)).toEqual(state)
    })
  })

  describe('loadMoreKeysSuccess', () => {
    it('should properly set the state with fetched data', () => {
      // Arrange

      const data = {
        total: 0,
        nextCursor: '0',
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
          ...data,
          previousResultCount: data.keys.length,
          lastRefreshTime: initialState.data.lastRefreshTime
        },
      }

      // Act
      const nextState = reducer(initialState, loadMoreKeysSuccess(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { keys: nextState },
      })
      expect(keysSelector(rootState)).toEqual(state)
    })

    it('should properly set the state with empty data', () => {
      // Arrange
      const data = {
        total: 0,
        nextCursor: '0',
        keys: [],
        scanned: 0,
        shardsMeta: {},
      }

      // Act
      const nextState = reducer(initialState, loadMoreKeysSuccess(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { keys: nextState },
      })
      expect(keysSelector(rootState)).toEqual(initialState)
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
        browser: { keys: nextState },
      })
      expect(keysSelector(rootState)).toEqual(state)
    })
  })

  describe('loadKeyInfoSuccess', () => {
    it('should properly set the state', () => {
      // Arrange
      const data = {
        name: stringToBuffer('keyName'),
        nameString: 'keyName',
        type: 'hash',
        ttl: -1,
        size: 279,
      }
      const state = {
        ...initialState,
        selectedKey: {
          ...initialState.selectedKey,
          loading: false,
          data: {
            ...data,
          },
        },
      }

      // Act
      const nextState = reducer(initialState, loadKeyInfoSuccess(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { keys: nextState },
      })
      expect(keysSelector(rootState)).toEqual(state)
    })
  })

  describe('refreshKeyInfo', () => {
    it('should properly set the state', () => {
      // Arrange
      const state = {
        ...initialState,
        selectedKey: {
          ...initialState.selectedKey,
          refreshing: true,
        },
      }

      // Act
      const nextState = reducer(initialState, refreshKeyInfo())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { keys: nextState },
      })
      expect(keysSelector(rootState)).toEqual(state)
    })
  })

  describe('refreshKeyInfoSuccess', () => {
    it('should properly set the state', () => {
      // Arrange
      const data = {
        name: 'keyName',
        type: 'hash',
        ttl: -1,
        size: 279,
        length: 3,
      }
      const state = {
        ...initialState,
        selectedKey: {
          ...initialState.selectedKey,
          refreshing: false,
          data: { ...initialState.selectedKey.data, ...data },
        },
      }

      // Act
      const nextState = reducer(initialState, refreshKeyInfoSuccess(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { keys: nextState },
      })
      expect(keysSelector(rootState)).toEqual(state)
    })
  })

  describe('refreshKeyInfoFail', () => {
    it('should properly set the state', () => {
      // Arrange
      const state = {
        ...initialState,
        selectedKey: {
          ...initialState.selectedKey,
          refreshing: false,
        },
      }

      // Act
      const nextState = reducer(initialState, refreshKeyInfoFail())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { keys: nextState },
      })
      expect(keysSelector(rootState)).toEqual(state)
    })
  })

  describe('addKey', () => {
    it('should properly set the state while adding a key', () => {
      // Arrange
      const state = {
        ...initialState,
        addKey: {
          ...initialState.addKey,
          loading: true,
          error: '',
        },
      }

      // Act
      const nextState = reducer(initialState, addKey())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { keys: nextState },
      })
      expect(keysSelector(rootState)).toEqual(state)
    })
  })

  describe('addKeySuccess', () => {
    it('should properly set the state after successfully added key', () => {
      // Arrange
      const state = {
        ...initialState,
        addKey: {
          ...initialState.addKey,
          loading: false,
        },
      }

      // Act
      const nextState = reducer(initialState, addKeySuccess())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { keys: nextState },
      })
      expect(keysSelector(rootState)).toEqual(state)
    })
  })

  describe('addKeyFailure', () => {
    it('should properly set the state on add key failure', () => {
      // Arrange
      const data = 'some error'
      const state = {
        ...initialState,
        addKey: {
          ...initialState.addKey,
          loading: false,
          error: data,
        },
      }

      // Act
      const nextState = reducer(initialState, addKeyFailure(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { keys: nextState },
      })
      expect(keysSelector(rootState)).toEqual(state)
    })
  })

  describe('resetAddKey', () => {
    it('should properly reset the state', () => {
      // Arrange
      const state = {
        ...initialState,
        addKey: {
          ...initialState.addKey,
          loading: false,
          error: '',
        },
      }

      // Act
      const nextState = reducer(initialState, resetAddKey())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { keys: nextState },
      })
      expect(keysSelector(rootState)).toEqual(state)
    })
  })

  describe('deleteKey', () => {
    it('should properly set the state before the delete key', () => {
      // Arrange
      const state = {
        ...initialState,
        selectedKey: {
          ...initialState.selectedKey,
          loading: true,
          data: null,
        },
      }

      // Act
      const nextState = reducer(initialState, deleteKey())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { keys: nextState },
      })
      expect(keysSelector(rootState)).toEqual(state)
    })
  })

  describe('deleteKeySuccess', () => {
    it('should properly set the state before the delete key', () => {
      // Arrange
      const state = {
        ...initialState,
        selectedKey: {
          ...initialState.selectedKey,
          loading: false,
          data: null,
        },
      }

      // Act
      const nextState = reducer(initialState, deleteKeySuccess())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { keys: nextState },
      })
      expect(keysSelector(rootState)).toEqual(state)
    })
  })

  describe('deleteKeyFailure', () => {
    it('should properly set the state before the delete key', () => {
      // Arrange
      const data = 'some error'
      const state = {
        ...initialState,
        selectedKey: {
          ...initialState.selectedKey,
          loading: false,
          error: data,
        },
      }

      // Act
      const nextState = reducer(initialState, deleteKeyFailure(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { keys: nextState },
      })
      expect(keysSelector(rootState)).toEqual(state)
    })
  })

  describe('defaultSelectedKeyAction', () => {
    it('should properly set the state before the delete key', () => {
      // Arrange
      const state = {
        ...initialState,
        selectedKey: {
          ...initialState.selectedKey,
          loading: true,
          error: '',
        },
      }

      // Act
      const nextState = reducer(initialState, defaultSelectedKeyAction())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { keys: nextState },
      })
      expect(keysSelector(rootState)).toEqual(state)
    })
  })

  describe('defaultSelectedKeyActionSuccess', () => {
    it('should properly set the state before the delete key', () => {
      // Arrange
      const state = {
        ...initialState,
        selectedKey: {
          ...initialState.selectedKey,
          loading: false,
        },
      }

      // Act
      const nextState = reducer(initialState, defaultSelectedKeyActionSuccess())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { keys: nextState },
      })
      expect(keysSelector(rootState)).toEqual(state)
    })
  })

  describe('defaultSelectedKeyActionFailure', () => {
    it('should properly set the state before the delete key', () => {
      // Arrange
      const data = 'some error'
      const state = {
        ...initialState,
        selectedKey: {
          ...initialState.selectedKey,
          loading: false,
          error: data,
        },
      }

      // Act
      const nextState = reducer(initialState, defaultSelectedKeyActionFailure(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { keys: nextState },
      })
      expect(keysSelector(rootState)).toEqual(state)
    })
  })

  describe('editKeyTTLFromList', () => {
    it('should properly set the state before the edit TTL', () => {
      // Arrange

      const data = {
        key: 'test',
        ttl: 1000,
      }

      const initialStateMock = {
        ...initialState,
        data: {
          keys: [{ name: data.key, ttl: -1 }],
        },
      }
      const state = {
        ...initialState,
        data: {
          keys: [{ name: data.key, ttl: data.ttl }],
        },
      }

      // Act
      const nextState = reducer(initialStateMock, editKeyTTLFromList(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { keys: nextState },
      })
      expect(keysSelector(rootState)).toEqual(state)
    })
  })

  describe('editKeyFromList', () => {
    it('should properly set the state before the edit key', () => {
      // Arrange

      const data = {
        key: 'test',
        newKey: 'test2',
      }

      const initialStateMock = {
        ...initialState,
        data: {
          keys: [{ name: data.key }],
        },
      }
      const state = {
        ...initialState,
        data: {
          keys: [{ name: data.newKey }],
        },
      }

      // Act
      const nextState = reducer(initialStateMock, editKeyFromList(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { keys: nextState },
      })
      expect(keysSelector(rootState)).toEqual(state)
    })
  })

  describe('thunks', () => {
    describe('fetchKeys', () => {
      it('call both loadKeys and loadKeysSuccess when fetch is successed', async () => {
        // Arrange
        const data = {
          total: 10,
          nextCursor: 20,
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
          data: [
            {
              total: data.total,
              scanned: data.scanned,
              cursor: 20,
              keys: [...data.keys],
            },
          ],
          status: 200,
        }

        apiService.get = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchKeys(0, 20))

        // Assert
        const expectedActions = [
          loadKeys(),
          loadKeysSuccess({
            data: parseKeysListResponse({}, responsePayload.data),
            isFiltered: false,
            isSearched: false,
          }),
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

        apiService.get = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchKeys('0', 20))

        // Assert
        const expectedActions = [
          loadKeys(),
          addErrorNotification(responsePayload as AxiosError),
          loadKeysFailure(errorMessage),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('fetchMoreKeys', () => {
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
          data: [
            {
              total: data.total,
              scanned: data.scanned,
              cursor: 20,
              keys: [...data.keys],
            },
          ],
          status: 200,
        }

        apiService.get = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchMoreKeys([], '0', 20))

        // Assert
        const expectedActions = [
          loadMoreKeys(),
          loadMoreKeysSuccess(parseKeysListResponse({}, responsePayload.data)),
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

        apiService.get = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchMoreKeys('0', 20))

        // Assert
        const expectedActions = [
          loadMoreKeys(),
          addErrorNotification(responsePayload as AxiosError),
          loadMoreKeysFailure(errorMessage),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('fetchKeyInfo', () => {
      it('call both defaultSelectedKeyAction and loadKeyInfoSuccess when fetch is successed', async () => {
        // Arrange
        const data = {
          name: stringToBuffer('string'),
          type: KeyTypes.String,
          ttl: -1,
          size: 10,
        }
        const responsePayload = { data, status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchKeyInfo(data.name))

        // Assert
        const expectedActions = [
          defaultSelectedKeyAction(),
          loadKeyInfoSuccess(responsePayload.data),
          updateSelectedKeyRefreshTime(Date.now()),
          // fetch keyInfo
          getString(),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })

      it('failed to fetch key info', async () => {
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
        await store.dispatch<any>(fetchKeyInfo('keyName'))

        // Assert
        const expectedActions = [
          defaultSelectedKeyAction(),
          addErrorNotification(responsePayload as AxiosError),
          defaultSelectedKeyActionFailure(errorMessage),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('refreshKeyInfoAction', () => {
      it('success to refresh key info', async () => {
        // Arrange
        const data = {
          name: stringToBuffer('keyName'),
          type: 'hash',
          ttl: -1,
          size: 279,
        }
        const responsePayload = { data, status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(refreshKeyInfoAction(stringToBuffer('keyName')))

        // Assert
        const expectedActions = [
          refreshKeyInfo(),
          refreshKeyInfoSuccess(responsePayload.data),
          updateSelectedKeyRefreshTime(Date.now()),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })

      it('failed to refresh key info', async () => {
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
        await store.dispatch<any>(refreshKeyInfoAction('keyName'))

        // Assert
        const expectedActions = [
          refreshKeyInfo(),
          refreshKeyInfoFail(),
          addErrorNotification(responsePayload as AxiosError),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('addHashKey', () => {
      it('success to add key', async () => {
        // Arrange
        const data: CreateHashWithExpireDto = {
          keyName: 'keyName',
          fields: [{ field: '1', value: '1' }],
        }
        const responsePayload = { data, status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(addHashKey(data, jest.fn()))

        // Assert
        const expectedActions = [
          addKey(),
          addKeySuccess(),
          addMessageNotification(successMessages.ADDED_NEW_KEY(data.keyName)),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('addHashZset', () => {
      it('success to add key', async () => {
        // Arrange
        const data: CreateZSetWithExpireDto = {
          keyName: 'keyName',
          members: [{ name: '1', score: 1 }],
        }
        const responsePayload = { data, status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(addZsetKey(data, jest.fn()))

        // Assert
        const expectedActions = [
          addKey(),
          addKeySuccess(),
          addMessageNotification(successMessages.ADDED_NEW_KEY(data.keyName)),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('addHashSet', () => {
      it('success to add key', async () => {
        // Arrange
        const data: CreateSetWithExpireDto = {
          keyName: 'keyName',
          members: ['member'],
        }
        const responsePayload = { data, status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(addSetKey(data, jest.fn()))

        // Assert
        const expectedActions = [
          addKey(),
          addKeySuccess(),
          addMessageNotification(successMessages.ADDED_NEW_KEY(data.keyName)),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('addStringKey', () => {
      it('success to add key', async () => {
        // Arrange
        const data: SetStringWithExpireDto = {
          keyName: 'keyName',
          value: 'string',
        }
        const responsePayload = { data, status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(addStringKey(data, jest.fn()))

        // Assert
        const expectedActions = [
          addKey(),
          addKeySuccess(),
          addMessageNotification(successMessages.ADDED_NEW_KEY(data.keyName)),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('addListKey', () => {
      it('success to add key', async () => {
        // Arrange
        const data: CreateListWithExpireDto = {
          keyName: 'keyName',
          destination: 'TAIL' as ListElementDestination,
          element: '1',
        }
        const responsePayload = { data, status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(addListKey(data, jest.fn()))

        // Assert
        const expectedActions = [
          addKey(),
          addKeySuccess(),
          addMessageNotification(successMessages.ADDED_NEW_KEY(data.keyName)),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('addReJSONKey', () => {
      it('success to add key', async () => {
        // Arrange
        const data: CreateRejsonRlWithExpireDto = {
          keyName: 'keyName',
          data: '{}',
        }
        const responsePayload = { data, status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(addReJSONKey(data, jest.fn()))

        // Assert
        const expectedActions = [
          addKey(),
          addKeySuccess(),
          addMessageNotification(successMessages.ADDED_NEW_KEY(data.keyName)),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('deleteKey', () => {
      it('call both deleteKey, deleteKeySuccess and deleteKeyFromList when delete is successed', async () => {
        // Arrange
        const data = {
          name: 'string',
          type: KeyTypes.String,
          ttl: -1,
          size: 10,
        }
        const responsePayload = { data, status: 200 }

        apiService.delete = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(deleteKeyAction(data.name))

        // Assert
        const expectedActions = [
          deleteKey(),
          deleteKeySuccess(),
          deleteKeyFromList(data.name),
          addMessageNotification(successMessages.DELETED_KEY(data.name)),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('editKey', () => {
      it('call both editKey, editKeySuccess and editKeyFromList when editing is successed', async () => {
        // Arrange
        const key = 'string'
        const newKey = 'string2'
        const responsePayload = { data: newKey, status: 200 }

        apiService.patch = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(editKey(key, newKey))

        // Assert
        const expectedActions = [defaultSelectedKeyAction(), editKeyFromList({ key, newKey })]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('editKeyTTL', () => {
      it('success editKeyTTL with positive ttl', async () => {
        // Arrange
        const key = 'string'
        const ttl = 1200
        const responsePayload = { status: 200 }

        apiService.patch = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(editKeyTTL(key, ttl))

        // Assert
        const expectedActions = [
          defaultSelectedKeyAction(),
          editKeyTTLFromList({ key, ttl }),

          // fetch keyInfo
          defaultSelectedKeyAction(),
          defaultSelectedKeyActionSuccess(),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })

      it('success editKeyTTL with ttl = 0', async () => {
        // Arrange
        const key = 'string'
        const ttl = 0
        const responsePayload = { status: 200 }

        apiService.patch = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(editKeyTTL(key, ttl))

        // Assert
        const expectedActions = [
          defaultSelectedKeyAction(),
          deleteKeySuccess(),
          deleteKeyFromList(key),
          defaultSelectedKeyActionSuccess(),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })
  })
})
