import React, { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import {
  aiChatSelector,
  askAiChatbotAction,
  getAiAgreementAction,
  getAiDatabaseAgreementAction,
  getAiChatHistoryAction,
  removeAiChatHistoryAction,
  clearAiDatabaseAgreement,
} from 'uiSrc/slices/panels/aiAssistant'
import { getCommandsFromQuery, Nullable } from 'uiSrc/utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { AiChatMessage, AiChatType } from 'uiSrc/slices/interfaces/aiAssistant'

import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { appRedisCommandsSelector } from 'uiSrc/slices/app/redis-commands'
import { oauthCloudUserSelector } from 'uiSrc/slices/oauth/cloud'
import { ChatForm, ChatHistory } from './components'

import ChatHeader from './components/chat-header'
import styles from './styles.module.scss'

const AiChat = () => {
  const { messages, generalAgreement, databaseAgreement, loading } = useSelector(aiChatSelector)
  const { modules, provider } = useSelector(connectedInstanceSelector)
  const { commandsArray: REDIS_COMMANDS_ARRAY } = useSelector(appRedisCommandsSelector)
  const { data: userOAuthProfile } = useSelector(oauthCloudUserSelector)
  const [settingsOpenedByDefault, setSettingsOpenedByDefault] = useState<boolean>(false)

  const [inProgressMessage, setinProgressMessage] = useState<Nullable<AiChatMessage>>(null)
  const { instanceId } = useParams<{ instanceId: string }>()

  const dispatch = useDispatch()

  useEffect(() => {
    if (!instanceId && databaseAgreement) {
      dispatch(clearAiDatabaseAgreement())
    }
    if (instanceId) {
      dispatch(getAiDatabaseAgreementAction(instanceId))
    }
    dispatch(getAiChatHistoryAction(instanceId))
  }, [instanceId, userOAuthProfile?.id])

  useEffect(() => {
    dispatch(getAiAgreementAction((agreement) => {
      if (!agreement?.consent) setSettingsOpenedByDefault(true)
    }))

    return () => setSettingsOpenedByDefault(false)
  }, [userOAuthProfile?.id])

  const handleSubmit = useCallback((message: string) => {
    sendChatMessage(message)
  }, [instanceId])

  const sendChatMessage = (message: string) => {
    dispatch(askAiChatbotAction(
      instanceId,
      message,
      {
        onMessage: (message: AiChatMessage) => {
          setinProgressMessage({ ...message })
        },
        onError: (errorCode: number) => {
          sendEventTelemetry({
            event: TelemetryEvent.AI_CHAT_BOT_ERROR_MESSAGE_RECEIVED,
            eventData: {
              chatBot: instanceId ? AiChatType.Database : AiChatType.General,
              errorCode
            }
          })
        },
        onFinish: () => setinProgressMessage(null)
      }
    ))

    sendEventTelemetry({
      event: TelemetryEvent.AI_CHAT_MESSAGE_SENT,
      eventData: {
        chatBot: instanceId ? AiChatType.Database : AiChatType.General,
      }
    })
  }

  const onClearSession = useCallback(() => {
    dispatch(removeAiChatHistoryAction(instanceId))
    sendEventTelemetry({
      event: TelemetryEvent.AI_CHAT_SESSION_RESTARTED,
      eventData: {
        chatBot: instanceId ? AiChatType.Database : AiChatType.General,
      }
    })
  }, [instanceId])

  const onRunCommand = useCallback((query: string) => {
    const command = getCommandsFromQuery(query, REDIS_COMMANDS_ARRAY) || ''
    sendEventTelemetry({
      event: TelemetryEvent.AI_CHAT_BOT_COMMAND_RUN_CLICKED,
      eventData: {
        databaseId: instanceId || undefined,
        chatBot: instanceId ? AiChatType.Database : AiChatType.General,
        provider,
        command
      }
    })
  }, [instanceId, provider])

  return (
    <div className={styles.wrapper} data-testid="ai-chat">
      <ChatHeader
        databaseId={instanceId}
        onRestart={onClearSession}
        generalAgreement={generalAgreement}
        databaseAgreement={databaseAgreement}
        settingsOpenedByDefault={settingsOpenedByDefault}
      />
      <div className={styles.chatHistory}>
        <ChatHistory
          autoScroll
          isLoading={loading}
          modules={modules}
          inProgressMessage={inProgressMessage}
          history={messages}
          onRunCommand={onRunCommand}
          onRestart={onClearSession}
        />
      </div>
      <div className={styles.chatForm}>
        <ChatForm
          isDisabled={inProgressMessage?.content === ''}
          onSubmit={handleSubmit}
          databaseId={instanceId}
          isGeneralAgreementAccepted={generalAgreement?.consent}
        />
      </div>
    </div>
  )
}

export default AiChat
