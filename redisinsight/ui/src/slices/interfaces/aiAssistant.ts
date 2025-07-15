export enum AiChatType {
  Assistance = 'document',
  Query = 'database',
  RdiHelper = 'rdi',
  DataGenerator = 'data-generator',
}

export enum AiChatMessageType {
  AIMessage = 'AIMessage',
  HumanMessage = 'HumanMessage',
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

export interface StateAiAssistant {
  activeTab: AiChatType
  assistant: {
    loading: boolean
    agreements: boolean
    id: string
    messages: Array<AiChatMessage>
  }
  expert: {
    loading: boolean
    agreements: string[]
    messages: Array<AiChatMessage>
  }
  rdiHelper: {
    loading: boolean
    agreements: boolean
    id: string
    messages: Array<AiChatMessage>
  }
  dataGenerator: {
    loading: boolean
    agreements: string[]
    messages: Array<AiChatMessage>
  }
}
