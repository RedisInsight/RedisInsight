import { cloneDeep } from 'lodash'
import reducer, {
  initialState,
  aiChatSelector,
  getAiChatHistory,
  getAiChatHistorySuccess,
  getAiChatHistoryFailed,
  getAiAgreement,
  getAiAgreementSuccess,
  getAiAgreementFailed,
  createAiAgreement,
  createAiAgreementSuccess,
  createAiAgreementFailed,
  clearAiAgreements,
  sendAiQuestion,
  sendAiAnswer,
  setAiQuestionError,
  clearAiChatHistory,
  getAiChatHistoryAction,
  getAiAgreementAction,
  removeAiChatHistoryAction,
  createAiAgreementAction,
  setHideCopilotSplashScreen,
} from 'uiSrc/slices/panels/aiAssistant'
import { cleanup, initialStateDefault, mockedStore } from 'uiSrc/utils/test-utils'
import { AiAgreement, AiChatMessage, AiChatMessageType, BotType } from 'uiSrc/slices/interfaces/aiAssistant'
import { apiService } from 'uiSrc/services'
import { addErrorNotification } from 'uiSrc/slices/app/notifications'
import { EnhancedAxiosError } from 'uiSrc/slices/interfaces'

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

    describe('setHideCopilotSplashScreen', () => {
      it('should properly set sate', () => {
        // Arrange
        const state = {
          ...initialState,
          hideCopilotSplashScreen: true,
        }

        // Act
        const nextState = reducer(initialState, setHideCopilotSplashScreen(true))

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          panels: { aiAssistant: nextState },
        })
        expect(aiChatSelector(rootState)).toEqual(state)
      })
    })

    describe('getAiAgreement', () => {
      it('should properly set state', () => {
        // Arrange
        const state = {
          ...initialState.ai,
          agreementLoading: true
        }

        // Act
        const nextState = reducer(initialState, getAiAgreement())

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          panels: { aiAssistant: nextState },
        })
        expect(aiChatSelector(rootState)).toEqual(state)
      })
    })

    describe('getAiAgreementSuccess', () => {
      it('should properly set state', () => {
        // Arrange
        const state = {
          ...initialState.ai,
          agreementLoading: false,
          agreements: expect.any(Array)
        }

        // Act
        const aiAgreement = { id: 'testId', databaseId: null, accountId: '1234', createdAt: new Date('2024-12-11') }
        const nextState = reducer(initialState, getAiAgreementSuccess(aiAgreement))

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
          ...initialState.ai,
          agreementLoading: false,
          agreements: expect.any(Array)
        }

        // Act
        const aiAgreement = { id: 'testId', databaseId: null, accountId: '1234', createdAt: new Date('2024-12-11') }
        const nextState = reducer(initialState, getAiAgreementSuccess(aiAgreement))

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          panels: { aiAssistant: nextState },
        })
        expect(aiChatSelector(rootState)).toEqual(state)
      })
    })

    describe('getAiAgreementFailed', () => {
      it('should properly set state', () => {
        // Arrange
        const state = {
          ...initialState.ai,
          agreementLoading: false,
        }

        // Act
        const nextState = reducer(initialState, getAiAgreementFailed())

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          panels: { aiAssistant: nextState },
        })
        expect(aiChatSelector(rootState)).toEqual(state)
      })
    })

    describe('createAiAgreement', () => {
      it('should properly set state', () => {
        // Arrange
        const state = {
          ...initialState.ai,
          agreementLoading: true
        }

        // Act
        const nextState = reducer(initialState, createAiAgreement())

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          panels: { aiAssistant: nextState },
        })
        expect(aiChatSelector(rootState)).toEqual(state)
      })
    })

    describe('createAiAgreementSuccess', () => {
      it('should properly set state', () => {
        const aiAgreement = { id: 'testId', databaseId: null, accountId: '1234', createdAt: new Date('2024-12-11') }
        // Arrange
        const state = {
          ...initialState.ai,
          agreementLoading: false,
          agreements: [aiAgreement]
        }

        // Act
        const nextState = reducer(initialState, createAiAgreementSuccess(aiAgreement))

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          panels: { aiAssistant: nextState },
        })
        expect(aiChatSelector(rootState)).toEqual(state)
      })
    })

    describe('createAiAgreementFailed', () => {
      it('should properly set state', () => {
        // Arrange
        const state = {
          ...initialState.ai,
          agreementLoading: false,
        }

        // Act
        const nextState = reducer(initialState, createAiAgreementFailed())

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          panels: { aiAssistant: nextState },
        })
        expect(aiChatSelector(rootState)).toEqual(state)
      })
    })

    describe('clearAiAgreements', () => {
      it('should properly set state', () => {
        // Arrange
        const state = {
          ...initialState.ai,
          agreements: []
        }

        // Act
        const nextState = reducer(initialState, clearAiAgreements())

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          panels: { aiAssistant: nextState },
        })
        expect(aiChatSelector(rootState)).toEqual(state)
      })
    })

    describe('getAiChatHistory', () => {
      it('should properly set state', () => {
        // Arrange
        const state = {
          ...initialState.ai,
          loading: true
        }

        // Act
        const nextState = reducer(initialState, getAiChatHistory())

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          panels: { aiAssistant: nextState },
        })
        expect(aiChatSelector(rootState)).toEqual(state)
      })
    })

    describe('getAiChatHistorySuccess', () => {
      it('should properly set state', () => {
        // Arrange
        const state = {
          ...initialState.ai,
          loading: false,
          messages: expect.any(Array)
        }

        // Act
        const nextState = reducer(initialState, getAiChatHistorySuccess([]))

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          panels: { aiAssistant: nextState },
        })
        expect(aiChatSelector(rootState)).toEqual(state)
      })
    })

    describe('getAiChatHistoryFailed', () => {
      it('should properly set state', () => {
        // Arrange
        const state = {
          ...initialState.ai,
          loading: false,
        }

        // Act
        const nextState = reducer(initialState, getAiChatHistoryFailed())

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          panels: { aiAssistant: nextState },
        })
        expect(aiChatSelector(rootState)).toEqual(state)
      })
    })

    describe('sendAiQuestion', () => {
      it('should properly set state', () => {
        // Arrange
        const humanMessage = {
          id: '1',
          type: AiChatMessageType.HumanMessage,
          content: 'message',
          context: {},
          tool: BotType.General,
        }
        const state = {
          ...initialState.ai,
          messages: [humanMessage]
        }

        // Act
        const nextState = reducer(initialState, sendAiQuestion(humanMessage))

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          panels: { aiAssistant: nextState },
        })
        expect(aiChatSelector(rootState)).toEqual(state)
      })
    })

    describe('sendAiAnswer', () => {
      it('should properly set state', () => {
        // Arrange
        const data: AiChatMessage = {
          id: '1',
          type: AiChatMessageType.AIMessage,
          content: 'message',
          context: {},
          tool: BotType.General
        }
        const state = {
          ...initialState.ai,
          messages: [data]
        }

        // Act
        const nextState = reducer(initialState, sendAiAnswer(data))

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          panels: { aiAssistant: nextState },
        })
        expect(aiChatSelector(rootState)).toEqual(state)
      })
    })

    describe('setAiQuestionError', () => {
      it('should properly set state', () => {
        // Arrange
        const currentState = {
          ...initialState,
          ai: {
            ...initialState.ai,
            messages: [{
              id: '1',
              content: '2'
            }]
          }
        } as any

        const data = {
          id: '1',
          error: {
            statusCode: 500,
            errorCode: 1
          }
        }

        const state = {
          ...initialState.ai,
          messages: [{
            ...data,
            content: '2',
          }]
        }

        // Act
        const nextState = reducer(currentState, setAiQuestionError(data))

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          panels: { aiAssistant: nextState },
        })
        expect(aiChatSelector(rootState)).toEqual(state)
      })
    })

    describe('clearAiChatHistory', () => {
      it('should properly set state', () => {
        // Arrange
        const currentState = {
          ...initialState,
          ai: {
            ...initialState.ai,
            messages: [{
              id: '1',
              content: '2'
            }]
          }
        } as any

        const state = {
          ...initialState.ai,
          messages: []
        }

        // Act
        const nextState = reducer(currentState, clearAiChatHistory())

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          panels: { aiAssistant: nextState },
        })
        expect(aiChatSelector(rootState)).toEqual(state)
      })
    })
  })

  describe('thunks', () => {
    describe('getAiChatHistoryAction', () => {
      it('should call proper actions with success result', async () => {
        const data: AiChatMessage[] = []

        const responsePayload = { data, status: 200 }

        apiService.get = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(getAiChatHistoryAction('1'))

        // Assert
        const expectedActions = [
          getAiChatHistory(),
          getAiChatHistorySuccess(data),
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
        } as EnhancedAxiosError

        apiService.get = jest.fn().mockRejectedValueOnce(responsePayload)

        // Act
        await store.dispatch<any>(getAiChatHistoryAction('1'))

        // Assert
        const expectedActions = [
          getAiChatHistory(),
          addErrorNotification(responsePayload),
          getAiChatHistoryFailed(),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('getAiAgreementAction', () => {
      it('should call proper actions with success result', async () => {
        const aiAgreement: AiAgreement = { id: 'id', databaseId: 'dbId', accountId: '1234', createdAt: new Date('2024-11-11') }
        const data = { aiAgreement }

        const responsePayload = { data, status: 200 }

        apiService.get = jest.fn().mockResolvedValueOnce(responsePayload)

        // Act
        await store.dispatch<any>(getAiAgreementAction('1'))

        // Assert
        const expectedActions = [
          getAiAgreement(),
          getAiAgreementSuccess(data.aiAgreement),
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
        } as EnhancedAxiosError

        apiService.get = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(getAiAgreementAction('1'))

        // Assert
        const expectedActions = [
          getAiAgreement(),
          addErrorNotification(responsePayload),
          getAiAgreementFailed(),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('createAiAgreementAction', () => {
      it('should call proper actions with success result', async () => {
        const aiAgreement: AiAgreement = { id: 'id', databaseId: '1', accountId: '1234', createdAt: new Date('2024-11-11') }

        const responsePayload = { data: aiAgreement, status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(createAiAgreementAction('1'))

        // Assert
        const expectedActions = [
          createAiAgreement(),
          createAiAgreementSuccess(aiAgreement),
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
        } as EnhancedAxiosError

        apiService.post = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(createAiAgreementAction('1'))

        // Assert
        const expectedActions = [
          createAiAgreement(),
          addErrorNotification(responsePayload),
          createAiAgreementFailed(),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('removeAiChatAction', () => {
      it('should call proper actions with success result', async () => {
        const responsePayload = { status: 200 }

        apiService.delete = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(removeAiChatHistoryAction('1'))

        // Assert
        const expectedActions = [
          clearAiChatHistory(),
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
        } as EnhancedAxiosError

        apiService.delete = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(removeAiChatHistoryAction('1'))

        // Assert
        const expectedActions = [
          addErrorNotification(responsePayload)
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })
  })
})
