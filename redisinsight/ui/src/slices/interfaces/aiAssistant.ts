import { Nullable } from 'uiSrc/utils'

export enum AiChatType {
  General = 'general',
  Database = 'database'
}

export enum AiChatMessageType {
  AIMessage = 'AIMessage',
  HumanMessage = 'HumanMessage'
}

export interface AiChatMessage {
  id: string
  type: AiChatMessageType
  content: string
  error?: {
    statusCode: number
    errorCode?: number
  }
  context?: {
    [key: string]: {
      title: string
      category: string
    }
  }
}

export interface AiAgreement {
  id: string
  databaseId: Nullable<string>
  accountId: string
  createdAt: Date
}

export interface StateAiAssistant {
  ai: {
    loading: boolean
    agreementLoading: boolean
    agreements: Nullable<AiAgreement[]>
    messages: Array<AiChatMessage>
  },
  hideCopilotSplashScreen: boolean
}
