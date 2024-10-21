import { cloneDeep } from 'lodash'
import reducer, {
  initialState,
  aiChatSelector,
  getAiChatHistory,
  getAiChatHistorySuccess,
  getAiChatHistoryFailed,
  clearAiAgreements,
  sendAiQuestion,
  sendAiAnswer,
  setAiQuestionError,
  clearAiChatHistory,
  getAiChatHistoryAction,
  removeAiChatHistoryAction,
  setHideCopilotSplashScreen,
  getAiAgreement,
  getAiAgreementSuccess,
  getAiAgreementFailed,
  getAiDatabaseAgreement,
  getAiDatabaseAgreementSuccess,
  getAiDatabaseAgreementFailed,
  updateAiAgreements,
  updateAiAgreementsSuccess,
  updateAiAgreementsFailed,
  removeAiChatHistory,
  removeAiChatHistorySuccess,
  removeAiChatHistoryFailed,
  getAiAgreementAction,
  getAiDatabaseAgreementAction,
  updateAiAgreementsAction,
  aiAssistantSelector,
} from 'uiSrc/slices/panels/aiAssistant'
import { cleanup, initialStateDefault, mockedStore } from 'uiSrc/utils/test-utils'
import { AiAgreement, AiChatMessage, AiChatMessageType, AiDatabaseAgreement, IUpdateAiAgreementsItem } from 'uiSrc/slices/interfaces/aiAssistant'
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
        expect(aiAssistantSelector(rootState)).toEqual(state)
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
        const aiAgreement = { accountId: '1234', consent: true }
        const state = {
          ...initialState.ai,
          agreementLoading: false,
          generalAgreement: aiAgreement
        }

        // Act
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

    describe('getAiDatabaseAgreement', () => {
      it('should properly set state', () => {
        // Arrange
        const state = {
          ...initialState.ai,
          databaseAgreementLoading: true
        }

        // Act
        const nextState = reducer(initialState, getAiDatabaseAgreement())

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          panels: { aiAssistant: nextState },
        })
        expect(aiChatSelector(rootState)).toEqual(state)
      })
    })

    describe('getAiDatabaseAgreementSuccess', () => {
      it('should properly set state', () => {
        // Arrange
        const aiAgreement = { accountId: '1234', databaseId: 'dbId', dataConsent: true }
        const state = {
          ...initialState.ai,
          agreementLoading: false,
          databaseAgreement: aiAgreement
        }

        // Act
        const nextState = reducer(initialState, getAiDatabaseAgreementSuccess(aiAgreement))

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          panels: { aiAssistant: nextState },
        })
        expect(aiChatSelector(rootState)).toEqual(state)
      })
    })

    describe('getAiDatabaseAgreementFailed', () => {
      it('should properly set state', () => {
        // Arrange
        const state = {
          ...initialState.ai,
          databaseAgreementLoading: false,
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

    describe('updateAiAgreements', () => {
      it('should properly set state', () => {
        // Arrange
        const state = {
          ...initialState.ai,
          agreementLoading: true
        }

        // Act
        const nextState = reducer(initialState, updateAiAgreements())

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          panels: { aiAssistant: nextState },
        })
        expect(aiChatSelector(rootState)).toEqual(state)
      })
    })

    describe('updateAiAgreementsSuccess', () => {
      it('should properly set state', () => {
        const updateAiAgreementResult = { generalAgreement: { accountId: '12345', consent: true }, databaseAgreement: { accountId: '12345', databaseId: 'dbId', dataConsent: true } }
        // Arrange
        const state = {
          ...initialState.ai,
          agreementLoading: false,
          ...updateAiAgreementResult
        }

        // Act
        const nextState = reducer(initialState, updateAiAgreementsSuccess(updateAiAgreementResult))

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          panels: { aiAssistant: nextState },
        })
        expect(aiChatSelector(rootState)).toEqual(state)
      })
    })

    describe('updateAiAgreementFailed', () => {
      it('should properly set state', () => {
        // Arrange
        const state = {
          ...initialState.ai,
          agreementLoading: false,
        }

        // Act
        const nextState = reducer(initialState, updateAiAgreementsFailed())

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
          generalAgreement: null,
          databaseAgreement: null,
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

    describe('removeAiChatHistory', () => {
      it('should properly set state', () => {
        // Arrange
        const state = {
          ...initialState.ai,
          loading: true
        }

        // Act
        const nextState = reducer(initialState, removeAiChatHistory())

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          panels: { aiAssistant: nextState },
        })
        expect(aiChatSelector(rootState)).toEqual(state)
      })
    })

    describe('removeAiChatHistorySuccess', () => {
      it('should properly set state', () => {
        // Arrange
        const state = {
          ...initialState.ai,
          loading: false,
          messages: []
        }

        // Act
        const nextState = reducer(initialState, removeAiChatHistorySuccess())

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          panels: { aiAssistant: nextState },
        })
        expect(aiChatSelector(rootState)).toEqual(state)
      })
    })

    describe('removeAiChatHistoryFailed', () => {
      it('should properly set state', () => {
        // Arrange
        const state = {
          ...initialState.ai,
          loading: false,
        }

        // Act
        const nextState = reducer(initialState, removeAiChatHistoryFailed())

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
        const onSuccess = jest.fn()
        const aiAgreement: AiAgreement = { accountId: '1234', consent: true }

        const responsePayload = { data: aiAgreement, status: 200 }

        apiService.get = jest.fn().mockResolvedValueOnce(responsePayload)

        // Act
        await store.dispatch<any>(getAiAgreementAction(onSuccess))

        // Assert
        const expectedActions = [
          getAiAgreement(),
          getAiAgreementSuccess(aiAgreement),
        ]
        expect(store.getActions()).toEqual(expectedActions)
        expect(onSuccess).toBeCalledWith(aiAgreement)
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
        await store.dispatch<any>(getAiAgreementAction())

        // Assert
        const expectedActions = [
          getAiAgreement(),
          addErrorNotification(responsePayload),
          getAiAgreementFailed(),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('getAiDatabaseAgreementAction', () => {
      it('should call proper actions with success result', async () => {
        const aiDatabaseAgreement: AiDatabaseAgreement = { accountId: '1234', databaseId: 'dbId', dataConsent: true }

        const responsePayload = { data: aiDatabaseAgreement, status: 200 }

        apiService.get = jest.fn().mockResolvedValueOnce(responsePayload)

        // Act
        await store.dispatch<any>(getAiDatabaseAgreementAction('dbId'))

        // Assert
        const expectedActions = [
          getAiDatabaseAgreement(),
          getAiDatabaseAgreementSuccess(aiDatabaseAgreement),
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
        await store.dispatch<any>(getAiDatabaseAgreementAction('dbId'))

        // Assert
        const expectedActions = [
          getAiDatabaseAgreement(),
          addErrorNotification(responsePayload),
          getAiDatabaseAgreementFailed(),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('updateAiAgreementsAction', () => {
      it('should call proper actions with success result', async () => {
        const databaseAgreement: AiDatabaseAgreement = { accountId: '1234', databaseId: 'dbId', dataConsent: true }
        const promises = [async () => Promise.resolve({ databaseAgreement })]

        // Act
        await store.dispatch<any>(updateAiAgreementsAction(promises))

        // Assert
        const expectedActions = [
          updateAiAgreements(),
          updateAiAgreementsSuccess({ databaseAgreement }),
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

        const promises = [async () => Promise.reject(responsePayload)]

        // Act
        await store.dispatch<any>(updateAiAgreementsAction(promises))

        // Assert
        const expectedActions = [
          updateAiAgreements(),
          addErrorNotification(responsePayload),
          updateAiAgreementsFailed(),
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
          removeAiChatHistory(),
          removeAiChatHistorySuccess(),
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
          removeAiChatHistory(),
          addErrorNotification(responsePayload),
          removeAiChatHistoryFailed(),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })
  })
})
