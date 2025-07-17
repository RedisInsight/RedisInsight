import React, { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { EuiButtonEmpty } from '@elastic/eui'

import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { AiChatMessage, AiChatType } from 'uiSrc/slices/interfaces/aiAssistant'
import { Nullable } from 'uiSrc/utils'
import {
  aiRdiHelperChatSelector,
  askRdiHelperChatbotAction,
  getRdiHelperChatHistoryAction,
  removeRdiHelperChatHistoryAction,
  updateRdiHelperChatAgreements,
} from 'uiSrc/slices/panels/aiAssistant'
import { rdiPipelineSelector } from 'uiSrc/slices/rdi/pipeline'

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



const RdiHelperChat = () => {
  const { messages, agreements, loading } = useSelector(
    aiRdiHelperChatSelector,
  )
  const { config, jobs, desiredPipeline } = useSelector(rdiPipelineSelector)

  const [inProgressMessage, setinProgressMessage] =
    useState<Nullable<AiChatMessage>>(null)
  const { rdiInstanceId } = useParams<{ rdiInstanceId: string }>()

  const isAgreementsAccepted =
    agreements.includes(rdiInstanceId) || messages.length > 0

  const dispatch = useDispatch()

  // Use desired pipeline if active, otherwise use current pipeline
  const currentConfig = desiredPipeline.active ? desiredPipeline.config : config
  const currentJobs = desiredPipeline.active ? desiredPipeline.jobs : jobs

  useEffect(() => {
    if (!rdiInstanceId) {
      return
    }

    dispatch(getRdiHelperChatHistoryAction(rdiInstanceId))
  }, [rdiInstanceId])

  const handleSubmit = useCallback(
    (message: string) => {
      if (!isAgreementsAccepted) {
        dispatch(updateRdiHelperChatAgreements(rdiInstanceId))
      }

      // Prepare pipeline context for AI assistant with most up-to-date values
      const pipelineContext = {
        config: currentConfig,
        jobs: currentJobs,
      }

      dispatch(
        askRdiHelperChatbotAction(rdiInstanceId, message, {
          pipelineContext,
          onMessage: (message: AiChatMessage) =>
            setinProgressMessage({ ...message }),
          onError: (errorCode: number) => {
            console.log('rdi ask error', errorCode)
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
    },
    [rdiInstanceId, isAgreementsAccepted, currentConfig, currentJobs],
  )

  const onClearSession = useCallback(() => {
    dispatch(removeRdiHelperChatHistoryAction(rdiInstanceId))

    sendEventTelemetry({
      event: TelemetryEvent.AI_CHAT_SESSION_RESTARTED,
      eventData: {
        chat: AiChatType.RdiHelper,
      },
    })
  }, [rdiInstanceId])

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
          isDisabled={!rdiInstanceId || inProgressMessage?.content === ''}
          placeholder="Ask me about RDI pipeline configuration..."
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  )
}

export default RdiHelperChat
