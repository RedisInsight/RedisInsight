import React, { Ref, useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { EuiButtonEmpty } from '@elastic/eui'
import {
  aiAssistantChatSelector,
  askAssistantChatbot,
  createAssistantChatAction,
  getAssistantChatHistoryAction,
  removeAssistantChatAction,
} from 'uiSrc/slices/panels/aiAssistant'
import { getCommandsFromQuery, Nullable, scrollIntoView } from 'uiSrc/utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { AiChatMessage, AiChatType } from 'uiSrc/slices/interfaces/aiAssistant'

import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { appRedisCommandsSelector } from 'uiSrc/slices/app/redis-commands'

import { AssistanceChatInitialMessage, ChatHistory, ChatForm } from '../shared'

import styles from './styles.module.scss'

const AssistanceChat = () => {
  const { id, messages } = useSelector(aiAssistantChatSelector)
  const { modules, provider } = useSelector(connectedInstanceSelector)
  const { commandsArray: REDIS_COMMANDS_ARRAY } = useSelector(appRedisCommandsSelector)

  const [progressingMessage, setProgressingMessage] = useState<Nullable<AiChatMessage>>(null)
  const scrollDivRef: Ref<HTMLDivElement> = useRef(null)
  const { instanceId } = useParams<{ instanceId: string }>()

  const dispatch = useDispatch()

  useEffect(() => {
    if (!id || messages.length) {
      scrollToBottom('auto')
      return
    }

    dispatch(getAssistantChatHistoryAction(id, () => scrollToBottom('auto')))
  }, [id])

  const handleSubmit = useCallback((message: string) => {
    scrollToBottom('smooth')

    if (!id) {
      dispatch(createAssistantChatAction((chatId) => sendChatMessage(chatId, message)))
      return
    }

    sendChatMessage(id, message)
  }, [id])

  const sendChatMessage = (chatId: string, message: string) => {
    dispatch(askAssistantChatbot(
      chatId,
      message,
      {
        onMessage: (message: AiChatMessage) => {
          setProgressingMessage({ ...message })
          scrollToBottom('auto')
        },
        onFinish: () => setProgressingMessage(null)
      }
    ))

    sendEventTelemetry({
      event: TelemetryEvent.AI_CHAT_MESSAGE_SENT,
      eventData: {
        chat: AiChatType.Assistance
      }
    })
  }

  const onRunCommand = useCallback((query: string) => {
    const command = getCommandsFromQuery(query, REDIS_COMMANDS_ARRAY) || ''
    sendEventTelemetry({
      event: TelemetryEvent.AI_CHAT_BOT_COMMAND_RUN_CLICKED,
      eventData: {
        databaseId: instanceId,
        chat: AiChatType.Assistance,
        provider,
        command
      }
    })
  }, [instanceId, provider])

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    requestAnimationFrame(() => {
      scrollIntoView(scrollDivRef?.current, {
        behavior,
        block: 'start',
        inline: 'start',
      })
    })
  }, [])

  const onClearSession = useCallback(() => {
    dispatch(removeAssistantChatAction(id))

    sendEventTelemetry({
      event: TelemetryEvent.AI_CHAT_SESSION_RESTARTED,
      eventData: {
        chat: AiChatType.Assistance
      }
    })
  }, [id])

  return (
    <div className={styles.wrapper} data-testid="ai-general-chat">
      <div className={styles.header}>
        <span />
        <EuiButtonEmpty
          disabled={!!progressingMessage || !messages?.length}
          iconType="eraser"
          size="xs"
          onClick={onClearSession}
          className={styles.headerBtn}
          data-testid="ai-general-restart-session-btn"
        />
      </div>
      <div className={styles.chatHistory}>
        <ChatHistory
          modules={modules}
          initialMessage={AssistanceChatInitialMessage}
          progressingMessage={progressingMessage}
          history={messages}
          scrollDivRef={scrollDivRef}
          onMessageRendered={scrollToBottom}
          onRunCommand={onRunCommand}
        />
      </div>
      <div className={styles.chatForm}>
        <ChatForm
          placeholder="Ask me about Redis"
          isDisabled={!!progressingMessage}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  )
}

export default AssistanceChat
