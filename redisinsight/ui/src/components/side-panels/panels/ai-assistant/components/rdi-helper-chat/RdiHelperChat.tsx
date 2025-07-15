import React, { useCallback, useState } from 'react'
import { useParams } from 'react-router-dom'
import { EuiButtonEmpty } from '@elastic/eui'

import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { AiChatMessage, AiChatType, AiChatMessageType } from 'uiSrc/slices/interfaces/aiAssistant'
import { Nullable } from 'uiSrc/utils'

import { ChatForm, ChatHistory, RestartChat } from '../shared'

import styles from './styles.module.scss'

const RDI_HELPER_INITIAL_MESSAGE = (
  <div>
    <p>👋 Hello! I&apos;m your RDI Helper, here to assist you with Redis Data Integration pipeline management.</p>
    <p>I can help you with:</p>
    <ul>
      <li>Pipeline configuration and syntax</li>
      <li>Data transformation troubleshooting</li>
      <li>RDI best practices and optimization</li>
      <li>Error resolution and debugging</li>
    </ul>
    <p>What can I help you with today?</p>
  </div>
)

const RDI_HELPER_AGREEMENTS = [
  'I understand that this RDI Helper feature is in preview',
  'AI-generated content may be inaccurate or incomplete',
  'I will verify important information independently'
]

const RdiHelperChat = () => {
  
  const [messages, setMessages] = useState<AiChatMessage[]>([])
  const [agreements, setAgreements] = useState<boolean>(false)
  const [loading] = useState<boolean>(false)
  const [inProgressMessage] = useState<Nullable<AiChatMessage>>(null)
  
  const { instanceId } = useParams<{ instanceId: string }>()

  const handleSubmit = useCallback(
    (message: string) => {
      if (!agreements) {
        setAgreements(true)
        sendEventTelemetry({
          event: TelemetryEvent.AI_CHAT_BOT_TERMS_ACCEPTED,
          eventData: {
            databaseId: instanceId,
            chat: AiChatType.RdiHelper,
          },
        })
      }

      // For now, this is a placeholder - the actual AI integration would go here
      // You would implement the RDI-specific AI chat logic here
      const userMessage: AiChatMessage = {
        id: Date.now().toString(),
        type: AiChatMessageType.HumanMessage,
        content: message,
      }
      
      setMessages(prev => [...prev, userMessage])
      
      // Simulate AI response (replace with actual AI integration)
      setTimeout(() => {
        const aiResponse: AiChatMessage = {
          id: (Date.now() + 1).toString(),
          type: AiChatMessageType.AIMessage,
          content: `Thank you for your RDI question: "${message}". This is a placeholder response. ` +
            `The actual RDI AI assistant integration would provide specific help with your pipeline management needs.`,
        }
        setMessages(prev => [...prev, aiResponse])
      }, 1000)

      sendEventTelemetry({
        event: TelemetryEvent.AI_CHAT_MESSAGE_SENT,
        eventData: {
          chat: AiChatType.RdiHelper,
        },
      })
    },
    [instanceId, agreements],
  )

  const onClearSession = useCallback(() => {
    setMessages([])
    setAgreements(false)
    
    sendEventTelemetry({
      event: TelemetryEvent.AI_CHAT_SESSION_RESTARTED,
      eventData: {
        chat: AiChatType.RdiHelper,
      },
    })
  }, [])

  const onRunCommand = useCallback(() => {
    // RDI-specific command handling would go here
  }, [])

  const handleAgreementsDisplay = useCallback(() => {
    sendEventTelemetry({
      event: TelemetryEvent.AI_CHAT_BOT_TERMS_DISPLAYED,
      eventData: {
        chat: AiChatType.RdiHelper,
      },
    })
  }, [])

  return (
    <div className={styles.wrapper} data-testid="ai-rdi-helper-chat">
      <div className={styles.header}>
        <span />
        <RestartChat
          button={
            <EuiButtonEmpty
              disabled={!!inProgressMessage || !messages?.length}
              iconType="eraser"
              size="xs"
              className={styles.headerBtn}
              data-testid="ai-rdi-restart-session-btn"
            />
          }
          onConfirm={onClearSession}
        />
      </div>
      <div className={styles.chatHistory}>
        <ChatHistory
          autoScroll
          isLoading={loading}
          modules={[]}
          initialMessage={RDI_HELPER_INITIAL_MESSAGE}
          inProgressMessage={inProgressMessage}
          history={messages}
          onRunCommand={onRunCommand}
          onRestart={onClearSession}
        />
      </div>
      <div className={styles.chatForm}>
        <ChatForm
          onAgreementsDisplayed={handleAgreementsDisplay}
          agreements={!agreements ? RDI_HELPER_AGREEMENTS : undefined}
          placeholder="Ask me about RDI pipeline configuration..."
          isDisabled={inProgressMessage?.content === ''}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  )
}

export default RdiHelperChat 