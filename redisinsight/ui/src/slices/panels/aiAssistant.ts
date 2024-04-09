import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { v4 as uuidv4 } from 'uuid'

import { apiService, sessionStorageService } from 'uiSrc/services'
import { ApiEndpoints, BrowserStorageItem } from 'uiSrc/constants'
import { AiChatType, AiChatMessage, AiChatMessageType, StateAiAssistant } from 'uiSrc/slices/interfaces/aiAssistant'
import { arrayCommandToString, toRedisCodeBlock, isStatusSuccessful } from 'uiSrc/utils'
import { getBaseUrl } from 'uiSrc/services/apiService'
import { CustomHeaders } from 'uiSrc/constants/api'
import { AppDispatch, RootState } from '../store'

const getTabSelected = (tab?: string): AiChatType => {
  if (Object.values(AiChatType).includes(tab as unknown as AiChatType)) return tab as AiChatType
  return AiChatType.Assistance
}

export const initialState: StateAiAssistant = {
  activeTab: getTabSelected(sessionStorageService.get(BrowserStorageItem.selectedAiChat)),
  assistant: {
    loading: false,
    id: sessionStorageService.get(BrowserStorageItem.aiChatSession) ?? '',
    messages: []
  },
  expert: {
    loading: false,
    messages: []
  }
}

// A slice for recipes
const aiAssistantSlice = createSlice({
  name: 'aiAssistant',
  initialState,
  reducers: {
    setSelectedTab: (state, { payload }: PayloadAction<AiChatType>) => {
      state.activeTab = payload
      sessionStorageService.set(BrowserStorageItem.selectedAiChat, payload)
    },
    createAssistantChat: (state) => {
      state.assistant.loading = true
    },
    createAssistantSuccess: (state, { payload }: PayloadAction<string>) => {
      state.assistant.id = payload
      state.assistant.loading = false

      sessionStorageService.set(BrowserStorageItem.aiChatSession, payload)
    },
    createAssistantFailed: (state) => {
      state.assistant.loading = false
    },
    getAssistantChatHistory: (state) => {
      state.assistant.loading = true
    },
    getAssistantChatHistorySuccess: (state, { payload }: PayloadAction<Array<AiChatMessage>>) => {
      state.assistant.loading = false
      state.assistant.messages = payload?.map((m) => ({ ...m, id: `ai_${uuidv4()}` })) || []
    },
    getAssistantChatHistoryFailed: (state) => {
      state.assistant.loading = false
    },
    removeAssistantChatHistory: (state) => {
      state.assistant.loading = true
    },
    removeAssistantChatHistorySuccess: (state) => {
      state.assistant.loading = false
      state.assistant.messages = []
      sessionStorageService.remove(BrowserStorageItem.aiChatSession)
    },
    removeAssistantChatHistoryFailed: (state) => {
      state.assistant.loading = false
    },
    sendQuestion: (state, { payload }: PayloadAction<string>) => {
      state.assistant.messages.push({
        id: `ai_${uuidv4()}`,
        type: AiChatMessageType.HumanMessage,
        content: payload,
        context: {}
      })
    },
    sendAnswer: (state, { payload }: PayloadAction<AiChatMessage>) => {
      state.assistant.messages.push(payload)
    },
    sendExpertQuestion: (state, { payload }: PayloadAction<string>) => {
      state.expert.messages.push({
        id: `ai_${uuidv4()}`,
        type: AiChatMessageType.HumanMessage,
        content: payload,
        context: {}
      })
    },
    sendExpertAnswer: (state, { payload }: PayloadAction<string>) => {
      state.expert.messages.push(
        {
          id: `ai_${uuidv4()}`,
          type: AiChatMessageType.AIMessage,
          content: payload,
          context: {}
        }
      )
    },
    clearExpertChatHistory: (state) => {
      state.expert.messages = []
    }
  }
})

// A selector
export const aiChatSelector = (state: RootState) => state.panels.aiAssistant
export const aiAssistantChatSelector = (state: RootState) => state.panels.aiAssistant.assistant
export const aiExpertChatSelector = (state: RootState) => state.panels.aiAssistant.expert

// Actions generated from the slice
export const {
  createAssistantChat,
  setSelectedTab,
  createAssistantSuccess,
  createAssistantFailed,
  getAssistantChatHistory,
  getAssistantChatHistorySuccess,
  getAssistantChatHistoryFailed,
  removeAssistantChatHistory,
  removeAssistantChatHistorySuccess,
  removeAssistantChatHistoryFailed,
  sendQuestion,
  sendAnswer,
  sendExpertAnswer,
  sendExpertQuestion,
  clearExpertChatHistory,
} = aiAssistantSlice.actions

// The reducer
export default aiAssistantSlice.reducer

export function createAssistantChatAction(onSuccess?: (chatId: string) => void, onFail?: () => void) {
  return async (dispatch: AppDispatch) => {
    dispatch(createAssistantChat())

    try {
      const { status, data } = await apiService.post<any>(ApiEndpoints.AI_ASSISTANT_CHATS)

      if (isStatusSuccessful(status)) {
        dispatch(createAssistantSuccess(data.id))
        onSuccess?.(data.id)
      }
    } catch (e) {
      dispatch(createAssistantFailed())
      onFail?.()
    }
  }
}

export function askAssistantChatbot(
  id: string,
  message: string,
  { onMessage, onFinish }: {
    onMessage?: (message: AiChatMessage) => void,
    onFinish?: () => void
  }
) {
  return async (dispatch: AppDispatch) => {
    dispatch(sendQuestion(message))

    const AiMessageProgressed: AiChatMessage = {
      id: `ai_${uuidv4()}`,
      type: AiChatMessageType.AIMessage,
      content: '',
    }

    onMessage?.(AiMessageProgressed)

    try {
      const baseUrl = getBaseUrl()
      const response = await fetch(`${baseUrl}${ApiEndpoints.AI_ASSISTANT_CHATS}/${id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
          [CustomHeaders.WindowId]: window.windowId || '',
        },
        body: JSON.stringify({ content: message })
      })

      const reader = response.body!.pipeThrough(new TextDecoderStream()).getReader()
      if (!isStatusSuccessful(response.status)) {
        throw new Error(response.statusText)
      }

      // eslint-disable-next-line no-constant-condition
      while (true) {
        // eslint-disable-next-line no-await-in-loop
        const { value, done } = await reader!.read()
        if (done) {
          dispatch(sendAnswer(AiMessageProgressed))
          onFinish?.()
          break
        }
        // console.log(value)
        AiMessageProgressed.content += value
        // dispatch(updateLastMessage(value))
        onMessage?.(AiMessageProgressed)
      }
    } catch (error) {
      console.error(error)
      onFinish?.()
    }
  }
}

export function getAssistantChatHistoryAction(
  id: string,
  onSuccess?: () => void
) {
  return async (dispatch: AppDispatch) => {
    dispatch(getAssistantChatHistory())

    try {
      const { status, data } = await apiService.get<any>(`${ApiEndpoints.AI_ASSISTANT_CHATS}/${id}`)

      if (isStatusSuccessful(status)) {
        dispatch(getAssistantChatHistorySuccess(data.messages))
        onSuccess?.()
      }
    } catch (e) {
      dispatch(getAssistantChatHistoryFailed())
    }
  }
}

export function removeAssistantChatAction(id: string) {
  return async (dispatch: AppDispatch) => {
    dispatch(removeAssistantChatHistory())

    try {
      const { status } = await apiService.delete<any>(`${ApiEndpoints.AI_ASSISTANT_CHATS}/${id}`)

      if (isStatusSuccessful(status)) {
        dispatch(removeAssistantChatHistorySuccess())
      }
    } catch (e) {
      dispatch(removeAssistantChatHistoryFailed())
    }
  }
}

export function askExpertChatbot(
  databaseId: string,
  message: string,
  onSuccess?: (chatId: string) => void,
  onFail?: () => void
) {
  return async (dispatch: AppDispatch) => {
    dispatch(sendExpertQuestion(message))

    try {
      const { status, data } = await apiService.post<any>(
        ApiEndpoints.AI_EXPERT_QUERIES,
        {
          databaseId,
          content: message
        }
      )

      if (isStatusSuccessful(status)) {
        if (data.error) {
          dispatch(sendExpertAnswer(data.error))
        } else {
          const markdownQuery = toRedisCodeBlock(arrayCommandToString(data.query))

          if (markdownQuery) {
            dispatch(sendExpertAnswer(markdownQuery))
          }
        }

        onSuccess?.(data)
      }
    } catch (e) {
      // dispatch(createAssistantFailed())
      onFail?.()
    }
  }
}
