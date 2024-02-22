export enum AiChatMessageType {
  AIMessage = 'AIMessage',
  HumanMessage = 'HumanMessage'
}

export interface AiChatMessage {
  id: string
  type: AiChatMessageType
  content: string
  context?: {
    [key: string]: {
      title: string
      category: string
    }
  }
}

export interface StateAiAssistant {
  assistant: {
    loading: boolean
    id: string
    messages: Array<AiChatMessage>
  }
}
