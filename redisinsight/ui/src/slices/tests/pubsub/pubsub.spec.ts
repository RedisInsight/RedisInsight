import { AxiosError } from 'axios'
import { cloneDeep } from 'lodash'
import { apiService } from 'uiSrc/services'
import { addErrorNotification } from 'uiSrc/slices/app/notifications'
import reducer, {
  concatPubSubMessages,
  initialState,
  PUB_SUB_ITEMS_MAX_COUNT,
  publishMessage,
  publishMessageAction,
  publishMessageError,
  publishMessageSuccess, pubSubSelector
} from 'uiSrc/slices/pubsub/pubsub'
import { cleanup, initialStateDefault, mockedStore } from 'uiSrc/utils/test-utils'

let store: typeof mockedStore

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

    describe('concatPubSubMessages', () => {
      it('should properly set payload to items', () => {
        const payload = {
          count: 2,
          messages: [
            {
              message: '1',
              channel: '2',
              time: 123123123
            },
            {
              message: '2',
              channel: '2',
              time: 123123123
            }
          ]
        }

        // Arrange
        const state: typeof initialState = {
          ...initialState,
          count: payload.count,
          messages: payload.messages
        }

        // Act
        const nextState = reducer(initialState, concatPubSubMessages(payload))

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          pubsub: nextState,
        })
        expect(pubSubSelector(rootState)).toEqual(state)
      })

      it('should properly set items no more than MONITOR_ITEMS_MAX_COUNT', () => {
        const payload = {
          count: PUB_SUB_ITEMS_MAX_COUNT + 10,
          messages: new Array(PUB_SUB_ITEMS_MAX_COUNT + 10)
        }

        // Arrange
        const state: typeof initialState = {
          ...initialState,
          count: PUB_SUB_ITEMS_MAX_COUNT + 10,
          messages: new Array(PUB_SUB_ITEMS_MAX_COUNT)
        }

        // Act
        const nextState = reducer(initialState, concatPubSubMessages(payload))

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          pubsub: nextState,
        })
        expect(pubSubSelector(rootState)).toEqual(state)
      })
    })
  })

  // thunks

  describe('thunks', () => {
    describe('publishMessageAction', () => {
      it('succeed to fetch data', async () => {
        const data = { affected: 1 }
        const responsePayload = { data, status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(
          publishMessageAction('123', 'channel', 'message')
        )

        // Assert
        const expectedActions = [
          publishMessage(),
          publishMessageSuccess(),
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
          publishMessageAction('123', 'channel', 'message')
        )

        // Assert
        const expectedActions = [
          publishMessage(),
          addErrorNotification(responsePayload as AxiosError),
          publishMessageError(errorMessage)
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })
  })
})
