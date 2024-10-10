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

export interface IUpdateAiAgreementPayload {
  generalAgreement?: AiAgreement
  databaseAgreement?: AiDatabaseAgreement
}

export interface AiAgreement {
  accountId: string
  consent: boolean
}

export interface AiDatabaseAgreement {
  databaseId: string
  accountId: string
  dataConsent: boolean
}

export interface StateAiAssistant {
  ai: {
    loading: boolean
    agreementLoading: boolean
    databaseAgreementLoading: boolean
    generalAgreement: Nullable<AiAgreement>
    databaseAgreement: Nullable<AiDatabaseAgreement>
    messages: Array<AiChatMessage>
  },
  hideCopilotSplashScreen: boolean
}
