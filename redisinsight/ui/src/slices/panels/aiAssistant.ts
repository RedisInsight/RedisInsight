import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { v4 as uuidv4 } from 'uuid'

import { apiService, sessionStorageService } from 'uiSrc/services'
import { ApiEndpoints, BrowserStorageItem } from 'uiSrc/constants'
import { AiChatMessage, AiChatMessageType, StateAiAssistant } from 'uiSrc/slices/interfaces/aiAssistant'
import { isStatusSuccessful } from 'uiSrc/utils'
import { getBaseUrl } from 'uiSrc/services/apiService'
import { AppDispatch, RootState } from '../store'

export const initialState: StateAiAssistant = {
  assistant: {
    loading: false,
    id: sessionStorageService.get(BrowserStorageItem.aiChatSession) ?? '',
    messages: []
  }
}

// A slice for recipes
const aiAssistantSlice = createSlice({
  name: 'aiAssistant',
  initialState,
  reducers: {
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
    createChatSession: (state, { payload }: PayloadAction<string>) => {
      state.assistant.id = payload
    },
    getAssistantChatHistory: (state) => {
      state.assistant.loading = true
    },
    getAssistantChatHistorySuccess: (state, { payload }: PayloadAction<Array<AiChatMessage>>) => {
      state.assistant.loading = false
      state.assistant.messages = payload.map((m) => ({ ...m, id: `ai_${uuidv4()}` }))
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
    clearHistory: (state) => {
      state.assistant.messages = []
    }
  }
})

// A selector
export const aiAssistantChatSelector = (state: RootState) => state.panels.aiAssistant.assistant

// Actions generated from the slice
export const {
  createAssistantChat,
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
  clearHistory,
} = aiAssistantSlice.actions

// The reducer
export default aiAssistantSlice.reducer

export function createAssistantChatAction(onSuccess?: (chatId: string) => void, onFail?: () => void) {
  return async (dispatch: AppDispatch) => {
    dispatch(createAssistantChat())

    try {
      const { status, data } = await apiService.post<any>(ApiEndpoints.AI_CHATS)

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
    onMessage?: (message: any) => void,
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
      const response = await fetch(`${baseUrl}${ApiEndpoints.AI_CHATS}/${id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
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
        console.log(value)
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
      const { status, data } = await apiService.get<any>(`${ApiEndpoints.AI_CHATS}/${id}`)

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
      const { status } = await apiService.delete<any>(`${ApiEndpoints.AI_CHATS}/${id}`)

      if (isStatusSuccessful(status)) {
        dispatch(removeAssistantChatHistorySuccess())
      }
    } catch (e) {
      dispatch(removeAssistantChatHistoryFailed())
    }
  }
}
