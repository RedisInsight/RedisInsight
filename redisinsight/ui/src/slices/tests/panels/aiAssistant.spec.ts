import { cloneDeep } from 'lodash'
import reducer, {
  initialState,
  getAssistantChatHistoryFailed,
  removeAssistantChatHistory,
  removeAssistantChatHistorySuccess,
  removeAssistantChatHistoryFailed,
  sendQuestion,
  sendAnswer,
  getAssistantChatHistorySuccess,
  aiAssistantChatSelector,
  createAssistantFailed,
  getAssistantChatHistory,
  aiChatSelector,
  createAssistantChat,
  setSelectedTab,
  createAssistantSuccess,
  createAssistantChatAction,
  getAssistantChatHistoryAction,
  removeAssistantChatAction,
} from 'uiSrc/slices/panels/aiAssistant'
import { cleanup, initialStateDefault, mockedStore } from 'uiSrc/utils/test-utils'
import { AiChatMessage, AiChatMessageType, AiChatType } from 'uiSrc/slices/interfaces/aiAssistant'
import { apiService } from 'uiSrc/services'

let store: typeof mockedStore

beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('ai assistant slice', () => {
  describe('reducer, actions and selectors', () => {
    it('should return the initial state on first run', () => {
      // Arrange
      const nextState = initialState

      // Act
      const result = reducer(undefined, {
        type: undefined
      })

      // Assert
      expect(result).toEqual(nextState)
    })

    describe('setSelectedTab', () => {
      it('should properly set state', () => {
        // Arrange
        const state = {
          ...initialState,
          activeTab: AiChatType.Query,
        }

        // Act
        const nextState = reducer(initialState, setSelectedTab(AiChatType.Query))

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          panels: { aiAssistant: nextState },
        })
        expect(aiChatSelector(rootState)).toEqual(state)
      })
    })

    describe('createAssistantChat', () => {
      it('should properly set state', () => {
        // Arrange
        const state = {
          ...initialState.assistant,
          loading: true
        }

        // Act
        const nextState = reducer(initialState, createAssistantChat())

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          panels: { aiAssistant: nextState },
        })
        expect(aiAssistantChatSelector(rootState)).toEqual(state)
      })
    })

    describe('createAssistantSuccess', () => {
      it('should properly set state', () => {
        // Arrange
        const state = {
          ...initialState.assistant,
          loading: false,
          id: '1'
        }

        // Act
        const nextState = reducer(initialState, createAssistantSuccess('1'))

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          panels: { aiAssistant: nextState },
        })
        expect(aiAssistantChatSelector(rootState)).toEqual(state)
      })
    })

    describe('createAssistantFailed', () => {
      it('should properly set state', () => {
        // Arrange
        const state = {
          ...initialState.assistant,
          loading: false,
        }

        // Act
        const nextState = reducer(initialState, createAssistantFailed())

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          panels: { aiAssistant: nextState },
        })
        expect(aiAssistantChatSelector(rootState)).toEqual(state)
      })
    })

    describe('getAssistantChatHistory', () => {
      it('should properly set state', () => {
        // Arrange
        const state = {
          ...initialState.assistant,
          loading: true
        }

        // Act
        const nextState = reducer(initialState, getAssistantChatHistory())

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          panels: { aiAssistant: nextState },
        })
        expect(aiAssistantChatSelector(rootState)).toEqual(state)
      })
    })

    describe('getAssistantChatHistorySuccess', () => {
      it('should properly set state', () => {
        // Arrange
        const state = {
          ...initialState.assistant,
          loading: false,
          messages: expect.any(Array)
        }

        // Act
        const nextState = reducer(initialState, getAssistantChatHistorySuccess([]))

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          panels: { aiAssistant: nextState },
        })
        expect(aiAssistantChatSelector(rootState)).toEqual(state)
      })
    })

    describe('getAssistantChatHistoryFailed', () => {
      it('should properly set state', () => {
        // Arrange
        const state = {
          ...initialState.assistant,
          loading: false,
        }

        // Act
        const nextState = reducer(initialState, getAssistantChatHistoryFailed())

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          panels: { aiAssistant: nextState },
        })
        expect(aiAssistantChatSelector(rootState)).toEqual(state)
      })
    })

    describe('getAssistantChatHistoryFailed', () => {
      it('should properly set state', () => {
        // Arrange
        const state = {
          ...initialState.assistant,
          loading: false,
        }

        // Act
        const nextState = reducer(initialState, getAssistantChatHistoryFailed())

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          panels: { aiAssistant: nextState },
        })
        expect(aiAssistantChatSelector(rootState)).toEqual(state)
      })
    })

    describe('removeAssistantChatHistory', () => {
      it('should properly set state', () => {
        // Arrange
        const state = {
          ...initialState.assistant,
          loading: true,
        }

        // Act
        const nextState = reducer(initialState, removeAssistantChatHistory())

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          panels: { aiAssistant: nextState },
        })
        expect(aiAssistantChatSelector(rootState)).toEqual(state)
      })
    })

    describe('removeAssistantChatHistorySuccess', () => {
      it('should properly set state', () => {
        // Arrange
        const state = {
          ...initialState.assistant,
          loading: false
        }

        // Act
        const nextState = reducer(initialState, removeAssistantChatHistorySuccess())

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          panels: { aiAssistant: nextState },
        })
        expect(aiAssistantChatSelector(rootState)).toEqual(state)
      })
    })

    describe('removeAssistantChatHistoryFailed', () => {
      it('should properly set state', () => {
        // Arrange
        const state = {
          ...initialState.assistant,
        }

        // Act
        const nextState = reducer(initialState, removeAssistantChatHistoryFailed())

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          panels: { aiAssistant: nextState },
        })
        expect(aiAssistantChatSelector(rootState)).toEqual(state)
      })
    })

    describe('sendQuestion', () => {
      it('should properly set state', () => {
        // Arrange
        const state = {
          ...initialState.assistant,
          messages: [{
            id: expect.any(String),
            type: AiChatMessageType.HumanMessage,
            content: 'message',
            context: {}
          }]
        }

        // Act
        const nextState = reducer(initialState, sendQuestion('message'))

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          panels: { aiAssistant: nextState },
        })
        expect(aiAssistantChatSelector(rootState)).toEqual(state)
      })
    })

    describe('sendAnswer', () => {
      it('should properly set state', () => {
        // Arrange
        const data: AiChatMessage = {
          id: '1',
          type: AiChatMessageType.AIMessage,
          content: 'message',
          context: {}
        }
        const state = {
          ...initialState.assistant,
          messages: [data]
        }

        // Act
        const nextState = reducer(initialState, sendAnswer(data))

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          panels: { aiAssistant: nextState },
        })
        expect(aiAssistantChatSelector(rootState)).toEqual(state)
      })
    })
  })

  describe('thunks', () => {
    describe('createAssistantChatAction', () => {
      it('should call proper actions with success result', async () => {
        const data = { id: '1' }

        const responsePayload = { data, status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(createAssistantChatAction())

        // Assert
        const expectedActions = [
          createAssistantChat(),
          createAssistantSuccess(data.id),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })

      it('should call proper actions with failed result', async () => {
        const errorMessage = 'Error'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.post = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(createAssistantChatAction())

        // Assert
        const expectedActions = [
          createAssistantChat(),
          createAssistantFailed(),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('getAssistantChatHistoryAction', () => {
      it('should call proper actions with success result', async () => {
        const data = { messages: [] }

        const responsePayload = { data, status: 200 }

        apiService.get = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(getAssistantChatHistoryAction('1'))

        // Assert
        const expectedActions = [
          getAssistantChatHistory(),
          getAssistantChatHistorySuccess(data.messages),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })

      it('should call proper actions with failed result', async () => {
        const errorMessage = 'Error'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.get = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(getAssistantChatHistoryAction('1'))

        // Assert
        const expectedActions = [
          getAssistantChatHistory(),
          getAssistantChatHistoryFailed(),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('removeAssistantChatAction', () => {
      it('should call proper actions with success result', async () => {
        const responsePayload = { status: 200 }

        apiService.delete = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(removeAssistantChatAction('1'))

        // Assert
        const expectedActions = [
          removeAssistantChatHistory(),
          removeAssistantChatHistorySuccess(),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })

      it('should call proper actions with failed result', async () => {
        const errorMessage = 'Error'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.delete = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(removeAssistantChatAction('1'))

        // Assert
        const expectedActions = [
          removeAssistantChatHistory(),
          removeAssistantChatHistoryFailed(),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })
  })
})
