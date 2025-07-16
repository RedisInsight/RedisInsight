import React, { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import {
  aiDataGeneratorChatSelector,
  askDataGeneratorChatbotAction,
  getDataGeneratorChatHistoryAction,
  removeDataGeneratorChatHistoryAction,
} from 'uiSrc/slices/panels/aiAssistant'
import { getCommandsFromQuery, Nullable } from 'uiSrc/utils'
import {
  connectedInstanceSelector,
} from 'uiSrc/slices/instances/instances'

import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { AiChatMessage, AiChatType } from 'uiSrc/slices/interfaces/aiAssistant'
import { appRedisCommandsSelector } from 'uiSrc/slices/app/redis-commands'
import DataGeneratorChatHeader from './components/data-generator-chat-header'

import { DATA_GENERATOR_CHAT_INITIAL_MESSAGE } from '../texts'
import { ChatForm, ChatHistory } from '../shared'

import styles from './styles.module.scss'

const DataGeneratorChat = () => {
  const { messages, agreements, loading } = useSelector(
    aiDataGeneratorChatSelector,
  )
  const {
    name: connectedInstanceName,
    modules,
    provider,
  } = useSelector(connectedInstanceSelector)
  const { commandsArray: REDIS_COMMANDS_ARRAY } = useSelector(
    appRedisCommandsSelector,
  )

  const [inProgressMessage, setinProgressMessage] =
    useState<Nullable<AiChatMessage>>(null)

  const { instanceId } = useParams<{ instanceId: string }>()

  const isAgreementsAccepted =
    agreements.includes(instanceId) || messages.length > 0

  const dispatch = useDispatch()

  useEffect(() => {
    if (!instanceId) {
      return
    }

    dispatch(getDataGeneratorChatHistoryAction(instanceId))
  }, [instanceId])

  const handleSubmit = useCallback(
    (message: string) => {
      dispatch(
        askDataGeneratorChatbotAction(instanceId, message, {
          onMessage: (message: AiChatMessage) =>
            setinProgressMessage({ ...message }),
          onError: (errorCode: number) => {
            console.log('Data Generator AI returned an error: ', errorCode)
          },
          onFinish: () => setinProgressMessage(null),
        }),
      )
    },
    [instanceId, isAgreementsAccepted],
  )

  const onRunCommand = useCallback(
    (query: string) => {
      const command = getCommandsFromQuery(query, REDIS_COMMANDS_ARRAY) || ''
      sendEventTelemetry({
        event: TelemetryEvent.AI_CHAT_BOT_COMMAND_RUN_CLICKED,
        eventData: {
          databaseId: instanceId,
          chat: AiChatType.Query,
          provider,
          command,
        },
      })
    },
    [instanceId, provider],
  )

  const onClearSession = useCallback(() => {
    dispatch(removeDataGeneratorChatHistoryAction(instanceId))
  }, [])

  const handleAgreementsDisplay = useCallback(() => {
    sendEventTelemetry({
      event: TelemetryEvent.AI_CHAT_BOT_TERMS_DISPLAYED,
      eventData: {
        chat: AiChatType.Query,
      },
    })
  }, [])

  const getValidationMessage = () => {
    if (!instanceId) {
      return {
        title: 'Open a database',
        content:
          'Open existing Redis database or create a new one to get started.',
      }
    }
    return undefined
  }

  return (
    <div className={styles.wrapper} data-testid="ai-document-chat">
      <DataGeneratorChatHeader
        connectedInstanceName={connectedInstanceName}
        databaseId={instanceId}
        isClearDisabled={!messages?.length || !instanceId}
        onRestart={onClearSession}
      />
      <div className={styles.chatHistory}>
        <ChatHistory
          autoScroll
          isLoading={loading}
          modules={modules}
          initialMessage={DATA_GENERATOR_CHAT_INITIAL_MESSAGE}
          inProgressMessage={inProgressMessage}
          history={messages}
          onRunCommand={onRunCommand}
          onRestart={onClearSession}
        />
      </div>
      <div className={styles.chatForm}>
        <ChatForm
          onAgreementsDisplayed={handleAgreementsDisplay}
          isDisabled={!instanceId || inProgressMessage?.content === ''}
          validation={getValidationMessage()}
          placeholder="Ask me to generate data"
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  )
}

export default DataGeneratorChat
