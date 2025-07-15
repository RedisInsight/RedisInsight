import React, { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { EuiButtonEmpty } from '@elastic/eui'

import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { AiChatMessage, AiChatType } from 'uiSrc/slices/interfaces/aiAssistant'
import { Nullable } from 'uiSrc/utils'
import { generateHumanMessage } from 'uiSrc/utils/transformers/chatbot'
import {
  aiRdiHelperChatSelector,
  askRdiHelperChatbot,
  createRdiHelperChatAction,
  getRdiHelperChatHistoryAction,
  removeRdiHelperChatAction,
  removeRdiHelperChatHistorySuccess,
  sendRdiHelperQuestion,
  updateRdiHelperChatAgreements,
} from 'uiSrc/slices/panels/aiAssistant'
import { CustomErrorCodes } from 'uiSrc/constants'

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
  const { id, messages, agreements, loading } = useSelector(
    aiRdiHelperChatSelector,
  )

  const [inProgressMessage, setinProgressMessage] =
    useState<Nullable<AiChatMessage>>(null)
  const { instanceId } = useParams<{ instanceId: string }>()

  const dispatch = useDispatch()

  useEffect(() => {
    if (!id || messages.length) return

    dispatch(getRdiHelperChatHistoryAction(id))
  }, [id])

  const handleSubmit = useCallback(
    (message: string) => {
      if (!agreements) {
        dispatch(updateRdiHelperChatAgreements(true))
        sendEventTelemetry({
          event: TelemetryEvent.AI_CHAT_BOT_TERMS_ACCEPTED,
          eventData: {
            databaseId: instanceId,
            chat: AiChatType.RdiHelper,
          },
        })
      }

      if (!id) {
        dispatch(
          createRdiHelperChatAction(
            (chatId) => sendChatMessage(chatId, message),
            // if cannot create a chat - just put message with error
            () => {
              dispatch(
                sendRdiHelperQuestion({
                  ...generateHumanMessage(message),
                  error: {
                    statusCode: 500,
                    errorCode: CustomErrorCodes.QueryAiInternalServerError,
                  },
                }),
              )

              sendEventTelemetry({
                event: TelemetryEvent.AI_CHAT_BOT_ERROR_MESSAGE_RECEIVED,
                eventData: {
                  chat: AiChatType.RdiHelper,
                  errorCode: 500,
                },
              })
            },
          ),
        )
        return
      }

      sendChatMessage(id, message)
    },
    [id, agreements, instanceId],
  )

  const sendChatMessage = (chatId: string, message: string) => {
    dispatch(
      askRdiHelperChatbot(chatId, message, {
        onMessage: (message: AiChatMessage) => {
          setinProgressMessage({ ...message })
        },
        onError: (errorCode: number) => {
          sendEventTelemetry({
            event: TelemetryEvent.AI_CHAT_BOT_ERROR_MESSAGE_RECEIVED,
            eventData: {
              chat: AiChatType.RdiHelper,
              errorCode,
            },
          })
        },
        onFinish: () => setinProgressMessage(null),
      }),
    )

    sendEventTelemetry({
      event: TelemetryEvent.AI_CHAT_MESSAGE_SENT,
      eventData: {
        chat: AiChatType.RdiHelper,
      },
    })
  }

  const onClearSession = useCallback(() => {
    if (!id) {
      dispatch(removeRdiHelperChatHistorySuccess())
      return
    }

    dispatch(removeRdiHelperChatAction(id))
    
    sendEventTelemetry({
      event: TelemetryEvent.AI_CHAT_SESSION_RESTARTED,
      eventData: {
        chat: AiChatType.RdiHelper,
      },
    })
  }, [id])

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