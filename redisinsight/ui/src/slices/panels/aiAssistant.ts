import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { v4 as uuidv4 } from 'uuid'

import { AxiosError } from 'axios'
import { apiService } from 'uiSrc/services'
import { ApiEndpoints } from 'uiSrc/constants'
import { AiAgreement, AiChatMessage, BotType, StateAiAssistant } from 'uiSrc/slices/interfaces/aiAssistant'
import {
  getApiErrorCode,
  getAxiosError,
  isStatusSuccessful,
  Maybe,
  Nullable,
  parseCustomError
} from 'uiSrc/utils'
import { getBaseUrl } from 'uiSrc/services/apiService'
import { getStreamedAnswer } from 'uiSrc/utils/api'
import ApiStatusCode from 'uiSrc/constants/apiStatusCode'
import { generateAiMessage, generateHumanMessage } from 'uiSrc/utils/transformers/chatbot'
import { logoutUserAction } from 'uiSrc/slices/oauth/cloud'
import { addErrorNotification } from 'uiSrc/slices/app/notifications'
import { EnhancedAxiosError } from 'uiSrc/slices/interfaces'
import { AppDispatch, RootState } from '../store'

export const initialState: StateAiAssistant = {
  ai: {
    loading: false,
    agreementLoading: false,
    agreements: [],
    messages: [],
  },
}

// A slice for recipes
const aiAssistantSlice = createSlice({
  name: 'aiAssistant',
  initialState,
  reducers: {
    getAiAgreement: (state) => {
      state.ai.agreementLoading = true
    },
    getAiAgreementSuccess: (state, { payload }: PayloadAction<AiAgreement>) => {
      state.ai.agreementLoading = false
      if (payload && !state.ai.agreements?.some((agr) =>
        agr.accountId === payload.accountId && agr.databaseId === payload.databaseId)) state.ai.agreements.push(payload)
    },
    getAiAgreementFailed: (state) => {
      state.ai.agreementLoading = false
    },

    createAiAgreement: (state) => {
      state.ai.agreementLoading = true
    },
    createAiAgreementSuccess: (state, { payload }: PayloadAction<AiAgreement>) => {
      state.ai.agreementLoading = false
      state.ai.agreements.push(payload)
    },
    createAiAgreementFailed: (state) => {
      state.ai.agreementLoading = false
    },

    clearAiAgreements: (state) => {
      state.ai.agreements = []
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

// Actions generated from the slice
export const {
  getAiAgreement,
  getAiAgreementSuccess,
  getAiAgreementFailed,

  createAiAgreement,
  createAiAgreementSuccess,
  createAiAgreementFailed,

  getAiChatHistory,
  getAiChatHistorySuccess,
  getAiChatHistoryFailed,

  sendAiQuestion,
  setAiQuestionError,
  sendAiAnswer,
  clearAiAgreements,
  clearAiChatHistory,
} = aiAssistantSlice.actions

// The reducer
export default aiAssistantSlice.reducer

export function getAiAgreementAction(instanceId: Nullable<string>, onSuccess?: () => void) {
  return async (dispatch: AppDispatch) => {
    dispatch(getAiAgreement())

    try {
      let aiUrl: string = ApiEndpoints.AI_CHAT
      if (instanceId) aiUrl += `/${instanceId}`
      const { status, data } = await apiService.get<any>(`${aiUrl}/messages/agreement`)

      if (isStatusSuccessful(status)) {
        dispatch(getAiAgreementSuccess(data.aiAgreement))
        onSuccess?.()
      }
    } catch (error) {
      const err = getAxiosError(error as EnhancedAxiosError)
      const errorCode = getApiErrorCode(error as AxiosError)

      if (errorCode === ApiStatusCode.Unauthorized) {
        dispatch<any>(logoutUserAction())
      }

      dispatch(addErrorNotification(err))
      dispatch(getAiAgreementFailed())
    }
  }
}

export function createAiAgreementAction(instanceId: Nullable<string>, onSuccess?: () => void) {
  return async (dispatch: AppDispatch) => {
    dispatch(createAiAgreement())

    try {
      let aiUrl: string = ApiEndpoints.AI_CHAT
      if (instanceId) aiUrl += `/${instanceId}`
      const { status, data } = await apiService.post<any>(`${aiUrl}/messages/agreement`)

      if (isStatusSuccessful(status)) {
        dispatch(createAiAgreementSuccess(data))
        onSuccess?.()
      }
    } catch (error) {
      const err = getAxiosError(error as EnhancedAxiosError)
      const errorCode = getApiErrorCode(error as AxiosError)

      if (errorCode === ApiStatusCode.Unauthorized) {
        dispatch<any>(logoutUserAction())
      }

      dispatch(addErrorNotification(err))
      dispatch(createAiAgreementFailed())
    }
  }
}

export function getAiChatHistoryAction(instanceId: Nullable<string>, onSuccess?: () => void) {
  return async (dispatch: AppDispatch) => {
    dispatch(getAiChatHistory())

    try {
      let aiUrl: string = ApiEndpoints.AI_CHAT
      if (instanceId) aiUrl += `/${instanceId}`
      const { status, data } = await apiService.get<any>(`${aiUrl}/messages`)

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
  tool: BotType,
  { onMessage, onError, onFinish }: {
    onMessage?: (message: AiChatMessage) => void,
    onError?: (errorCode: number) => void,
    onFinish?: () => void
  }
) {
  return async (dispatch: AppDispatch) => {
    const humanMessage = generateHumanMessage(message, tool)
    const aiMessageProgressed: AiChatMessage = generateAiMessage(tool)

    dispatch(sendAiQuestion(humanMessage))

    onMessage?.(aiMessageProgressed)

    const baseUrl = getBaseUrl()
    let aiUrl: string = `${baseUrl}${ApiEndpoints.AI_CHAT}`
    if (databaseId) aiUrl += `/${databaseId}`
    aiUrl += '/messages'

    await getStreamedAnswer(
      aiUrl,
      message,
      tool,
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
    let aiUrl: string = ApiEndpoints.AI_CHAT
    if (databaseId) aiUrl += `/${databaseId}`
    try {
      const { status } = await apiService.delete<any>(`${aiUrl}/messages`)
      if (isStatusSuccessful(status)) {
        dispatch(clearAiChatHistory())
        onSuccess?.()
      }
    } catch (error) {
      const err = getAxiosError(error as EnhancedAxiosError)
      const errorCode = getApiErrorCode(error as AxiosError)

      if (errorCode === ApiStatusCode.Unauthorized) {
        dispatch<any>(logoutUserAction())
      }

      dispatch(addErrorNotification(err))
    }
  }
}
