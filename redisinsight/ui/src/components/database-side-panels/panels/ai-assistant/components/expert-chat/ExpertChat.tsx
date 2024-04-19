import React, { Ref, useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { EuiButtonEmpty, EuiText, EuiToolTip } from '@elastic/eui'
import { useParams } from 'react-router-dom'
import {
  aiExpertChatSelector,
  askExpertChatbotAction,
  getExpertChatHistoryAction,
  removeExpertChatHistoryAction,
} from 'uiSrc/slices/panels/aiAssistant'
import { getCommandsFromQuery, Nullable, scrollIntoView } from 'uiSrc/utils'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'

import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { AiChatMessage, AiChatType } from 'uiSrc/slices/interfaces/aiAssistant'
import { appRedisCommandsSelector } from 'uiSrc/slices/app/redis-commands'
import ChatHistory from '../chat-history'
import ChatForm from '../chat-form'
import { ExpertEmptyHistoryText } from '../empty-history/texts'

import styles from './styles.module.scss'

const ExpertChat = () => {
  const { messages, loading } = useSelector(aiExpertChatSelector)
  const { name: connectedInstanceName, modules, provider } = useSelector(connectedInstanceSelector)
  const { commandsArray: REDIS_COMMANDS_ARRAY } = useSelector(appRedisCommandsSelector)

  const [progressingMessage, setProgressingMessage] = useState<Nullable<AiChatMessage>>(null)

  const scrollDivRef: Ref<HTMLDivElement> = useRef(null)
  const { instanceId } = useParams<{ instanceId: string }>()

  const dispatch = useDispatch()

  useEffect(() => {
    if (messages.length) {
      scrollToBottom('auto')
      return
    }

    if (instanceId) {
      dispatch(getExpertChatHistoryAction(instanceId, () => scrollToBottom('auto')))
    }
  }, [instanceId])

  const handleSubmit = useCallback((message: string) => {
    scrollToBottom()

    dispatch(askExpertChatbotAction(
      instanceId,
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
        chat: AiChatType.Query
      }
    })
  }, [instanceId])

  const onClearSession = () => {
    dispatch(removeExpertChatHistoryAction(instanceId))

    sendEventTelemetry({
      event: TelemetryEvent.AI_CHAT_SESSION_RESTARTED,
      eventData: {
        chat: AiChatType.Query
      }
    })
  }

  const onRunCommand = useCallback((query: string) => {
    const command = getCommandsFromQuery(query, REDIS_COMMANDS_ARRAY) || ''
    sendEventTelemetry({
      event: TelemetryEvent.AI_CHAT_BOT_COMMAND_RUN_CLICKED,
      eventData: {
        databaseId: instanceId,
        chat: AiChatType.Query,
        provider,
        command
      }
    })
  }, [instanceId, provider])

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    setTimeout(() => {
      scrollIntoView(scrollDivRef?.current, {
        behavior,
        block: 'start',
        inline: 'start',
      })
    }, 0)
  }

  return (
    <div className={styles.wrapper} data-testid="ai-document-chat">
      <div className={styles.header}>
        {instanceId ? (
          <EuiToolTip
            content={connectedInstanceName}
            anchorClassName={styles.dbName}
          >
            <EuiText size="xs" className="truncateText">db: {connectedInstanceName}</EuiText>
          </EuiToolTip>
        ) : (<span />)}
        <EuiButtonEmpty
          disabled={!messages?.length}
          iconType="eraser"
          size="xs"
          onClick={onClearSession}
          className={styles.startSessionBtn}
        >
          Clear
        </EuiButtonEmpty>
      </div>
      <div className={styles.chatHistory}>
        <ChatHistory
          isLoading={loading}
          modules={modules}
          welcomeText={ExpertEmptyHistoryText}
          progressingMessage={progressingMessage}
          history={messages}
          scrollDivRef={scrollDivRef}
          onRunCommand={onRunCommand}
          onSubmit={handleSubmit}
        />
      </div>
      <div className={styles.chatForm}>
        <ChatForm
          isDisabled={!instanceId || !!progressingMessage}
          validationMessage={!instanceId ? 'Open a database' : undefined}
          placeholder="Type / for specialized expertise"
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  )
}

export default ExpertChat
