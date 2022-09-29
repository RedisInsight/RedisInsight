import { cloneDeep, uniqBy } from 'lodash'
import { cleanup, initialStateDefault, mockedStore, } from 'uiSrc/utils/test-utils'
import { apiService } from 'uiSrc/services'
import { ICommand, MOCK_COMMANDS_SPEC } from 'uiSrc/constants'
import reducer, {
  initialState,
  getRedisCommands,
  getRedisCommandsFailure,
  getRedisCommandsSuccess,
  appRedisCommandsSelector,
  fetchRedisCommandsInfo
} from '../../app/redis-commands'

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
 * getRedisCommands tests
 *
 * @group unit
 */
  describe('getRedisCommands', () => {
    it('should properly set loading', () => {
      // Arrange
      const loading = true
      const state = {
        ...initialState,
        loading
      }

      // Act
      const nextState = reducer(initialState, getRedisCommands())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { redisCommands: nextState },
      })

      expect(appRedisCommandsSelector(rootState)).toEqual(state)
    })
  })

  /**
 * getRedisCommandsSuccess tests
 *
 * @group unit
 */
  describe('getRedisCommandsSuccess', () => {
    it('should properly set state after success', () => {
      // Arrange
      const data = MOCK_COMMANDS_SPEC
      const state = {
        ...initialState,
        spec: data,
        commandsArray: Object.keys(data).sort(),
        commandGroups: uniqBy(Object.values(data), 'group')
          .map((item: ICommand) => item.group)
      }

      // Act
      const nextState = reducer(initialState, getRedisCommandsSuccess(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { redisCommands: nextState },
      })

      expect(appRedisCommandsSelector(rootState)).toEqual(state)
    })
  })

  /**
 * getRedisCommandsFailure tests
 *
 * @group unit
 */
  describe('getRedisCommandsFailure', () => {
    it('should properly set error', () => {
      // Arrange
      const error = 'error'
      const state = {
        ...initialState,
        loading: false,
        error
      }

      // Act
      const nextState = reducer(initialState, getRedisCommandsFailure(error))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { redisCommands: nextState },
      })

      expect(appRedisCommandsSelector(rootState)).toEqual(state)
    })
  })

  // thunks
  /**
 * fetchRedisCommandsInfo tests
 *
 * @group unit
 */
  describe('fetchRedisCommandsInfo', () => {
    it('succeed to fetch redis commands', async () => {
      // Arrange
      const data = MOCK_COMMANDS_SPEC
      const responsePayload = { status: 200, data }

      apiService.get = jest.fn().mockResolvedValue(responsePayload)

      // Act
      await store.dispatch<any>(fetchRedisCommandsInfo(jest.fn()))

      // Assert
      const expectedActions = [
        getRedisCommands(),
        getRedisCommandsSuccess(data),
      ]

      expect(mockedStore.getActions()).toEqual(expectedActions)
    })

    it('failed to fetch server info', async () => {
      // Arrange
      const errorMessage = 'Something was wrong!'
      const responsePayload = {
        response: {
          status: 500,
          data: { message: errorMessage },
        },
      }
      apiService.get = jest.fn().mockRejectedValue(responsePayload)

      // Act
      await store.dispatch<any>(fetchRedisCommandsInfo(jest.fn(), jest.fn()))

      // Assert
      const expectedActions = [
        getRedisCommands(),
        getRedisCommandsFailure(errorMessage),
      ]

      expect(mockedStore.getActions()).toEqual(expectedActions)
    })
  })
})
