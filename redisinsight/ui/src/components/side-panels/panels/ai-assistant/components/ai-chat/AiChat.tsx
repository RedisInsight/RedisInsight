import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useParams } from 'react-router-dom'
import {
  aiChatSelector,
  askAiChatbotAction,
  clearAiAgreements,
  clearAiChatHistory,
  getAiAgreementAction,
  getAiChatHistoryAction,
  removeAiChatHistoryAction,
} from 'uiSrc/slices/panels/aiAssistant'
import { getCommandsFromQuery, Nullable } from 'uiSrc/utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { AiChatMessage, BotType } from 'uiSrc/slices/interfaces/aiAssistant'

import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { appRedisCommandsSelector } from 'uiSrc/slices/app/redis-commands'
import { oauthCloudUserSelector } from 'uiSrc/slices/oauth/cloud'
import { ChatForm, ChatHistory } from '../shared'

import ChatHeader from '../shared/chat-header'
import styles from './styles.module.scss'

const AiChat = () => {
  const { messages, agreements, loading } = useSelector(aiChatSelector)
  const { name: connectedInstanceName, modules, provider } = useSelector(connectedInstanceSelector)
  const { commandsArray: REDIS_COMMANDS_ARRAY } = useSelector(appRedisCommandsSelector)
  const { data: userOAuthProfile } = useSelector(oauthCloudUserSelector)
  const [dbId, setDbId] = useState<Nullable<string>>(null)

  const [inProgressMessage, setinProgressMessage] = useState<Nullable<AiChatMessage>>(null)
  const { instanceId } = useParams<{ instanceId: string }>()
  const { pathname } = useLocation()
  const currentAccountIdRef = useRef(userOAuthProfile?.id)

  const dispatch = useDispatch()

  const isAgreementAccepted = (databaseId: Nullable<string>) => agreements.some((agr) => agr?.databaseId === databaseId)

  const fetchMessagesAndAgreements = (dbId: Nullable<string>) => {
    if (!isAgreementAccepted(dbId)) {
      dispatch(getAiAgreementAction(dbId))
    }
    if (dbId && !isAgreementAccepted(null)) {
      dispatch(getAiAgreementAction(null))
    }
    dispatch(getAiChatHistoryAction(dbId))
  }

  useEffect(() => {
    if (pathname.indexOf('integrate') >= 0 || !instanceId) {
      setDbId(null)
      fetchMessagesAndAgreements(null)
    } else if (instanceId && instanceId !== dbId) {
      setDbId(instanceId)
      fetchMessagesAndAgreements(instanceId)
    }
  }, [pathname, instanceId, userOAuthProfile?.id])

  useEffect(() => {
    if (!userOAuthProfile?.id) {
      dispatch(clearAiChatHistory())
      dispatch(clearAiAgreements())
      return
    }
    if (currentAccountIdRef.current !== userOAuthProfile?.id) {
      currentAccountIdRef.current = userOAuthProfile?.id
      fetchMessagesAndAgreements(dbId)
    }
  }, [userOAuthProfile?.id])

  const handleSubmit = useCallback((message: string) => {
    sendChatMessage(message)
  }, [agreements, dbId])

  const sendChatMessage = (message: string) => {
    let messageCopy = message.trim()
    let botType = BotType.General
    if (messageCopy.startsWith('/query')) {
      // cut off /query from message
      messageCopy = messageCopy.slice(6).trim()
      botType = BotType.Query
    }

    dispatch(askAiChatbotAction(
      dbId,
      messageCopy,
      botType,
      {
        onMessage: (message: AiChatMessage) => {
          setinProgressMessage({ ...message })
        },
        onError: (errorCode: number) => {
          sendEventTelemetry({
            event: TelemetryEvent.AI_CHAT_BOT_ERROR_MESSAGE_RECEIVED,
            eventData: {
              chat: botType,
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
        chat: botType
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
        chat: dbId ? BotType.Query : BotType.General,
      }
    })
  }, [messages])

  const onRunCommand = useCallback((query: string) => {
    const command = getCommandsFromQuery(query, REDIS_COMMANDS_ARRAY) || ''
    sendEventTelemetry({
      event: TelemetryEvent.AI_CHAT_BOT_COMMAND_RUN_CLICKED,
      eventData: {
        databaseId: dbId || undefined,
        chat: dbId ? BotType.Query : BotType.General,
        provider,
        command
      }
    })
  }, [dbId, provider])

  return (
    <div className={styles.wrapper} data-testid="ai-chat">
      <ChatHeader
        connectedInstanceName={connectedInstanceName}
        databaseId={dbId}
        isClearDisabled={!!inProgressMessage || !messages?.length}
        onRestart={onClearSession}
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
          dbId={dbId}
        />
      </div>
      <div className={styles.chatForm}>
        <ChatForm
          isDisabled={inProgressMessage?.content === ''}
          onSubmit={handleSubmit}
          dbId={dbId}
          modules={modules}
          isAgreementAccepted={isAgreementAccepted}
        />
      </div>
    </div>
  )
}

export default AiChat
