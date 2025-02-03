import { v4 as uuidv4 } from 'uuid'
import { AiChatMessage, AiChatMessageType, AiTool } from 'uiSrc/slices/interfaces/aiAssistant'

export const generateHumanMessage = (message: string, tool: AiTool): AiChatMessage => ({
  id: `ai_${uuidv4()}`,
  type: AiChatMessageType.HumanMessage,
  content: message,
  tool,
  context: {}
})

export const generateAiMessage = (tool: AiTool): AiChatMessage => ({
  id: `ai_${uuidv4()}`,
  type: AiChatMessageType.AIMessage,
  content: '',
  tool,
})
