import { v4 as uuidv4 } from 'uuid'
import { AiChatMessage, AiChatMessageType, BotType } from 'uiSrc/slices/interfaces/aiAssistant'

export const generateHumanMessage = (message: string, tool: BotType): AiChatMessage => ({
  id: `ai_${uuidv4()}`,
  type: AiChatMessageType.HumanMessage,
  content: message,
  tool,
  context: {}
})

export const generateAiMessage = (tool: BotType): AiChatMessage => ({
  id: `ai_${uuidv4()}`,
  type: AiChatMessageType.AIMessage,
  content: '',
  tool,
})
