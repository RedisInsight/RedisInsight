import { cloneDeep } from 'lodash'
import { cleanup, initialStateDefault, mockedStore, } from 'uiSrc/utils/test-utils'
import { resourcesService } from 'uiSrc/services'
import reducer, {
  initialState,
  getContent,
  getContentSuccess,
  getContentFailure,
  contentSelector,
  fetchContentAction
} from '../../content/create-redis-buttons'

const MOCK_CONTENT = {
  cloud: {
    title: 'Limited offer.',
    description: 'Try Redis Cloud.',
    links: {
      main: {
        altText: 'Try Redis Cloud.',
        url: 'url'
      }
    },
  }
}
let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

/**
 * slices tests
 *
 * @group unit
 */
describe('slices', () => {
/**
 * reducer, actions and selectors tests
 *
 * @group unit
 */
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

  /**
 * getContent tests
 *
 * @group unit
 */
  describe('getContent', () => {
    it('should properly set loading', () => {
      // Arrange
      const loading = true
      const state = {
        ...initialState,
        loading
      }

      // Act
      const nextState = reducer(initialState, getContent())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        content: { createRedisButtons: nextState },
      })

      expect(contentSelector(rootState)).toEqual(state)
    })
  })

  /**
 * getContentSuccess tests
 *
 * @group unit
 */
  describe('getContentSuccess', () => {
    it('should properly set state after success', () => {
      // Arrange
      const data = MOCK_CONTENT
      const state = {
        ...initialState,
        data,
        loading: false,
      }

      // Act
      const nextState = reducer(initialState, getContentSuccess(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        content: { createRedisButtons: nextState },
      })

      expect(contentSelector(rootState)).toEqual(state)
    })
  })

  /**
 * getContentFailure tests
 *
 * @group unit
 */
  describe('getContentFailure', () => {
    it('should properly set error', () => {
      // Arrange
      const error = 'error'
      const state = {
        ...initialState,
        loading: false,
        error
      }

      // Act
      const nextState = reducer(initialState, getContentFailure(error))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        content: { createRedisButtons: nextState },
      })

      expect(contentSelector(rootState)).toEqual(state)
    })
  })

  // thunks
  /**
 * fetchContentAction tests
 *
 * @group unit
 */
  describe('fetchContentAction', () => {
    it('succeed to fetch content', async () => {
      // Arrange
      const data = MOCK_CONTENT
      const responsePayload = { status: 200, data }

      resourcesService.get = jest.fn().mockResolvedValue(responsePayload)

      // Act
      await store.dispatch<any>(fetchContentAction())

      // Assert
      const expectedActions = [
        getContent(),
        getContentSuccess(data),
      ]

      expect(mockedStore.getActions()).toEqual(expectedActions)
    })

    it('failed to fetch content', async () => {
      // Arrange
      const errorMessage = 'Something was wrong!'
      const responsePayload = {
        response: {
          status: 500,
          data: { message: errorMessage },
        },
      }
      resourcesService.get = jest.fn().mockRejectedValue(responsePayload)

      // Act
      await store.dispatch<any>(fetchContentAction())

      // Assert
      const expectedActions = [
        getContent(),
        getContentFailure(errorMessage),
      ]

      expect(mockedStore.getActions()).toEqual(expectedActions)
    })
  })
})
