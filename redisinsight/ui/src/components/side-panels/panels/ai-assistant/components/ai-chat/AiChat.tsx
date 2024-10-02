import React, { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useParams } from 'react-router-dom'
import {
  aiChatSelector,
  askAiChatbotAction,
  clearAiChatHistory,
  getAiAgreementsAction,
  getAiChatHistoryAction,
  removeAiChatHistoryAction,
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
  const { messages, agreements, loading } = useSelector(aiChatSelector)
  const { modules, provider } = useSelector(connectedInstanceSelector)
  const { commandsArray: REDIS_COMMANDS_ARRAY } = useSelector(appRedisCommandsSelector)
  const { data: userOAuthProfile } = useSelector(oauthCloudUserSelector)
  const [dbId, setDbId] = useState<Nullable<string>>(null)

  const [inProgressMessage, setinProgressMessage] = useState<Nullable<AiChatMessage>>(null)
  const { instanceId } = useParams<{ instanceId: string }>()
  const { pathname } = useLocation()

  const dispatch = useDispatch()

  const isGeneralAgreementAccepted = () => (agreements ? agreements?.some((agr) => agr?.databaseId === null) : false)

  useEffect(() => {
    if (pathname.indexOf('integrate') >= 0 || !instanceId) {
      setDbId(null)
      dispatch(getAiChatHistoryAction(null))
    } else if (instanceId && instanceId !== dbId) {
      setDbId(instanceId)
      dispatch(getAiChatHistoryAction(instanceId))
    }
  }, [pathname, instanceId, userOAuthProfile?.id])

  useEffect(() => {
    if (!userOAuthProfile?.id && messages?.length) {
      dispatch(clearAiChatHistory())
    }

    dispatch(getAiAgreementsAction())
  }, [userOAuthProfile?.id])

  const handleSubmit = useCallback((message: string) => {
    sendChatMessage(message)
  }, [agreements, dbId])

  const sendChatMessage = (message: string) => {
    dispatch(askAiChatbotAction(
      dbId,
      message,
      {
        onMessage: (message: AiChatMessage) => {
          setinProgressMessage({ ...message })
        },
        onError: (errorCode: number) => {
          sendEventTelemetry({
            event: TelemetryEvent.AI_CHAT_BOT_ERROR_MESSAGE_RECEIVED,
            eventData: {
              chatBot: dbId ? AiChatType.Database : AiChatType.General,
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
        chatBot: dbId ? AiChatType.Database : AiChatType.General,
      }
    })
  }

  const onClearSession = useCallback(() => {
    if (!messages?.length) {
      dispatch(clearAiChatHistory())
      return
    }

    dispatch(removeAiChatHistoryAction(dbId))

    sendEventTelemetry({
      event: TelemetryEvent.AI_CHAT_SESSION_RESTARTED,
      eventData: {
        chatBot: dbId ? AiChatType.Database : AiChatType.General,
      }
    })
  }, [messages])

  const onRunCommand = useCallback((query: string) => {
    const command = getCommandsFromQuery(query, REDIS_COMMANDS_ARRAY) || ''
    sendEventTelemetry({
      event: TelemetryEvent.AI_CHAT_BOT_COMMAND_RUN_CLICKED,
      eventData: {
        databaseId: dbId || undefined,
        chatBot: dbId ? AiChatType.Database : AiChatType.General,
        provider,
        command
      }
    })
  }, [dbId, provider])

  return (
    <div className={styles.wrapper} data-testid="ai-chat">
      <ChatHeader
        databaseId={dbId}
        onRestart={onClearSession}
        agreements={agreements}
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
          dbId={dbId}
          isGeneralAgreementAccepted={isGeneralAgreementAccepted()}
        />
      </div>
    </div>
  )
}

export default AiChat
