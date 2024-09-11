import { Nullable } from 'uiSrc/utils'

export enum BotType {
  General = 'General',
  Query = 'Query',
}

export enum AiChatType {
  Assistance = 'document',
  Query = 'database'
}

export enum AiChatMessageType {
  AIMessage = 'AIMessage',
  HumanMessage = 'HumanMessage'
}

export interface AiChatMessage {
  id: string
  type: AiChatMessageType
  content: string
  tool: BotType
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
    agreements: AiAgreement[]
    messages: Array<AiChatMessage>
  }
}
