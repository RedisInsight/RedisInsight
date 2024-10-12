import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { v4 as uuidv4 } from 'uuid'

import { AxiosError } from 'axios'
import { apiService, localStorageService } from 'uiSrc/services'
import { BrowserStorageItem } from 'uiSrc/constants'
import { AiAgreement, AiChatMessage, AiDatabaseAgreement, IUpdateAiAgreementPayload, StateAiAssistant } from 'uiSrc/slices/interfaces/aiAssistant'
import {
  getApiErrorCode,
  getAxiosError,
  isStatusSuccessful,
  Maybe,
  Nullable,
  parseCustomError
} from 'uiSrc/utils'
import { getBaseUrl } from 'uiSrc/services/apiService'
import { getAiUrl, getStreamedAnswer } from 'uiSrc/utils/api'
import ApiStatusCode from 'uiSrc/constants/apiStatusCode'
import { generateAiMessage, generateHumanMessage } from 'uiSrc/utils/transformers/chatbot'
import { logoutUserAction } from 'uiSrc/slices/oauth/cloud'
import { addErrorNotification } from 'uiSrc/slices/app/notifications'
import { EnhancedAxiosError } from 'uiSrc/slices/interfaces'
import { AiChatPath } from 'uiSrc/constants/api'
import { AppDispatch, RootState } from '../store'

export const initialState: StateAiAssistant = {
  ai: {
    loading: false,
    agreementLoading: false,
    generalAgreement: null,
    databaseAgreementLoading: false,
    databaseAgreement: null,
    messages: [],
  },
  hideCopilotSplashScreen: localStorageService.get(BrowserStorageItem.hideCopilotSplashScreen) ?? false,
}

// A slice for recipes
const aiAssistantSlice = createSlice({
  name: 'aiAssistant',
  initialState,
  reducers: {
    setHideCopilotSplashScreen: (state, { payload }: PayloadAction<boolean>) => {
      state.hideCopilotSplashScreen = payload
      localStorageService.set(BrowserStorageItem.hideCopilotSplashScreen, payload)
    },

    getAiAgreement: (state) => {
      state.ai.agreementLoading = true
    },
    getAiAgreementSuccess: (state, { payload }: PayloadAction<AiAgreement>) => {
      state.ai.agreementLoading = false
      state.ai.generalAgreement = payload
    },
    getAiAgreementFailed: (state) => {
      state.ai.agreementLoading = false
    },

    getAiDatabaseAgreement: (state) => {
      state.ai.databaseAgreementLoading = true
    },
    getAiDatabaseAgreementSuccess: (state, { payload }: PayloadAction<AiDatabaseAgreement>) => {
      state.ai.databaseAgreementLoading = false
      state.ai.databaseAgreement = payload
    },
    getAiDatabaseAgreementFailed: (state) => {
      state.ai.databaseAgreementLoading = false
    },

    clearAiAgreements: (state) => {
      state.ai.generalAgreement = null
      state.ai.databaseAgreement = null
    },

    clearAiDatabaseAgreement: (state) => {
      state.ai.databaseAgreement = null
    },

    updateAiAgreements: (state) => {
      state.ai.agreementLoading = true
    },
    // TODO add payload interface
    updateAiAgreementsSuccess: (state, { payload }: PayloadAction<IUpdateAiAgreementPayload>) => {
      state.ai = { ...state.ai, agreementLoading: false, ...payload }
    },
    updateAiAgreementsFailed: (state) => {
      state.ai.agreementLoading = false
    },

    getAiChatHistory: (state) => {
      state.ai.loading = true
    },
    getAiChatHistorySuccess: (state, { payload }: PayloadAction<Array<AiChatMessage>>) => {
      state.ai.loading = false
      state.ai.messages = payload?.map((m) => ({ ...m, id: `ai_${uuidv4()}` })) || []
    },
    getAiChatHistoryFailed: (state) => {
      state.ai.loading = false
    },

    removeAiChatHistory: (state) => {
      state.ai.loading = true
    },
    removeAiChatHistorySuccess: (state) => {
      state.ai.loading = false
      state.ai.messages = []
    },
    removeAiChatHistoryFailed: (state) => {
      state.ai.loading = false
    },

    sendAiQuestion: (state, { payload }: PayloadAction<AiChatMessage>) => {
      state.ai.messages.push(payload)
    },
    setAiQuestionError: (
      state,
      { payload }: PayloadAction<{
        id: string,
        error: Maybe<{
          statusCode: number
          errorCode?: number
          details?: Record<string, any>
        }>
      }>
    ) => {
      state.ai.messages = state.ai.messages.map((item) => (item.id === payload.id ? {
        ...item,
        error: payload.error
      } : item))
    },
    sendAiAnswer: (state, { payload }: PayloadAction<AiChatMessage>) => {
      state.ai.messages.push(payload)
    },
    clearAiChatHistory: (state) => {
      state.ai.messages = []
    },
  }
})

// A selector
export const aiChatSelector = (state: RootState) => state.panels.aiAssistant.ai
export const aiAssistantSelector = (state: RootState) => state.panels.aiAssistant

// Actions generated from the slice
export const {
  getAiAgreement,
  getAiAgreementSuccess,
  getAiAgreementFailed,

  getAiDatabaseAgreement,
  getAiDatabaseAgreementSuccess,
  getAiDatabaseAgreementFailed,

  updateAiAgreements,
  updateAiAgreementsSuccess,
  updateAiAgreementsFailed,

  getAiChatHistory,
  getAiChatHistorySuccess,
  getAiChatHistoryFailed,

  removeAiChatHistory,
  removeAiChatHistorySuccess,
  removeAiChatHistoryFailed,

  sendAiQuestion,
  setAiQuestionError,
  sendAiAnswer,
  clearAiAgreements,
  clearAiDatabaseAgreement,

  clearAiChatHistory,
  setHideCopilotSplashScreen,
} = aiAssistantSlice.actions

// The reducer
export default aiAssistantSlice.reducer

export function getAiAgreementAction(onSuccess?: (data: Nullable<AiAgreement>) => void, onFailure?: () => void) {
  return async (dispatch: AppDispatch) => {
    dispatch(getAiAgreement())

    try {
      const aiUrl = getAiUrl(AiChatPath.Agreements)
      const { status, data } = await apiService.get<any>(aiUrl)

      if (isStatusSuccessful(status)) {
        dispatch(getAiAgreementSuccess(data))
        onSuccess?.(data)
      }
    } catch (error) {
      const err = getAxiosError(error as EnhancedAxiosError)
      const errorCode = getApiErrorCode(error as AxiosError)

      if (errorCode === ApiStatusCode.Unauthorized) {
        dispatch<any>(logoutUserAction())
      }

      dispatch(addErrorNotification(err))
      dispatch(getAiAgreementFailed())
      onFailure?.()
    }
  }
}

export function getAiDatabaseAgreementAction(databaseId: string, onSuccess?: () => void, onFailure?: () => void) {
  return async (dispatch: AppDispatch) => {
    dispatch(getAiDatabaseAgreement())

    try {
      const aiUrl = getAiUrl(databaseId, AiChatPath.Agreements)
      const { status, data } = await apiService.get<any>(aiUrl)

      if (isStatusSuccessful(status)) {
        dispatch(getAiDatabaseAgreementSuccess(data))
      }

      onSuccess?.()
    } catch (error) {
      const err = getAxiosError(error as EnhancedAxiosError)
      const errorCode = getApiErrorCode(error as AxiosError)

      if (errorCode === ApiStatusCode.Unauthorized) {
        dispatch<any>(logoutUserAction())
      }

      dispatch(addErrorNotification(err))
      dispatch(getAiDatabaseAgreementFailed())
      onFailure?.()
    }
  }
}

export function updateAiAgreementsAction(
  promises: Array<() => Promise<any>>,
  onSuccess?: () => void,
  onFailure?: () => void
) {
  return async (dispatch: AppDispatch) => {
    dispatch(updateAiAgreements())

    try {
      if (!promises.length) {
        onSuccess?.()
      } else {
        const results = await Promise.all(promises.map(async (promiseFunc: any) => promiseFunc()))
        dispatch(updateAiAgreementsSuccess(Object.assign({}, ...results)))
        onSuccess?.()
      }
    } catch (error) {
      const err = getAxiosError(error as EnhancedAxiosError)
      const errorCode = getApiErrorCode(error as AxiosError)

      if (errorCode === ApiStatusCode.Unauthorized) {
        dispatch<any>(logoutUserAction())
      }

      dispatch(addErrorNotification(err))
      dispatch(updateAiAgreementsFailed())
      onFailure?.()
    }
  }
}

export function getAiChatHistoryAction(databaseId: Nullable<string>, onSuccess?: () => void) {
  return async (dispatch: AppDispatch) => {
    dispatch(getAiChatHistory())

    try {
      const aiUrl = getAiUrl(databaseId, AiChatPath.Messages)
      const { status, data } = await apiService.get<any>(aiUrl)

      if (isStatusSuccessful(status)) {
        dispatch(getAiChatHistorySuccess(data))
        onSuccess?.()
      }
    } catch (error) {
      const err = getAxiosError(error as EnhancedAxiosError)
      const errorCode = getApiErrorCode(error as AxiosError)

      if (errorCode === ApiStatusCode.Unauthorized) {
        dispatch<any>(logoutUserAction())
      }

      dispatch(addErrorNotification(err))
      dispatch(getAiChatHistoryFailed())
    }
  }
}

export function askAiChatbotAction(
  databaseId: Nullable<string>,
  message: string,
  { onMessage, onError, onFinish }: {
    onMessage?: (message: AiChatMessage) => void,
    onError?: (errorCode: number) => void,
    onFinish?: () => void
  }
) {
  return async (dispatch: AppDispatch) => {
    const humanMessage = generateHumanMessage(message)
    const aiMessageProgressed: AiChatMessage = generateAiMessage()

    dispatch(sendAiQuestion(humanMessage))

    onMessage?.(aiMessageProgressed)

    const baseUrl = getBaseUrl()
    const aiUrl = getAiUrl(databaseId, AiChatPath.Messages)
    const url: string = `${baseUrl}${aiUrl}`

    await getStreamedAnswer(
      url,
      message,
      {
        onMessage: (value: string) => {
          aiMessageProgressed.content += value
          onMessage?.(aiMessageProgressed)
        },
        onFinish: () => {
          dispatch(sendAiAnswer(aiMessageProgressed))
          onFinish?.()
        },
        onError: (error: any) => {
          if (error?.status === ApiStatusCode.Unauthorized) {
            const err = parseCustomError(error)
            dispatch(addErrorNotification(err))
            dispatch(logoutUserAction())
          } else {
            dispatch(setAiQuestionError({
              id: humanMessage.id,
              error: {
                statusCode: error?.status ?? 500,
                errorCode: error?.errorCode,
                details: error?.details
              }
            }))
          }

          onError?.(error?.status ?? 500)
          onFinish?.()
        }
      }
    )
  }
}

export function removeAiChatHistoryAction(
  databaseId: Nullable<string>,
  onSuccess?: () => void
) {
  return async (dispatch: AppDispatch) => {
    dispatch(removeAiChatHistory())
    const aiUrl = getAiUrl(databaseId, AiChatPath.Messages)
    try {
      const { status } = await apiService.delete<any>(aiUrl)
      if (isStatusSuccessful(status)) {
        dispatch(removeAiChatHistorySuccess())
        onSuccess?.()
      }
    } catch (error) {
      const err = getAxiosError(error as EnhancedAxiosError)
      const errorCode = getApiErrorCode(error as AxiosError)

      if (errorCode === ApiStatusCode.Unauthorized) {
        dispatch<any>(logoutUserAction())
      }

      dispatch(addErrorNotification(err))
      dispatch(removeAiChatHistoryFailed())
    }
  }
}
