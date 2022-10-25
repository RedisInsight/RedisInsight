import { AxiosError } from 'axios'
import { cloneDeep } from 'lodash'
import { apiService } from 'uiSrc/services'
import { cleanup, initialStateDefault, mockedStore } from 'uiSrc/utils/test-utils'
import { addErrorNotification } from 'uiSrc/slices/app/notifications'
import { stringToBuffer } from 'uiSrc/utils'
import { REDISEARCH_LIST_DATA_MOCK } from 'uiSrc/mocks/handlers/browser/redisearchHandlers'
import { refreshKeyInfo } from '../../browser/keys'
import reducer, {
  fetchRedisearchListAction,
  initialState,
  loadList,
  loadListFailure,
  loadListSuccess,
  redisearchDataSelector,
  redisearchSelector,
} from '../../browser/redisearch'

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

jest.mock('uiSrc/services', () => ({
  ...jest.requireActual('uiSrc/services'),
}))

describe('redisearch slice', () => {
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
          loadListSuccess(responsePayload.data),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })
  })
})
