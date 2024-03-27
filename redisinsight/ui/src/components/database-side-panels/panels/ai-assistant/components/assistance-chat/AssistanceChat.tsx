import React, { Ref, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { EuiButtonEmpty } from '@elastic/eui'
import {
  aiAssistantChatSelector,
  askAssistantChatbot,
  createAssistantChatAction,
  getAssistantChatHistoryAction,
  removeAssistantChatAction
} from 'uiSrc/slices/panels/aiAssistant'
import { Nullable, scrollIntoView } from 'uiSrc/utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { AiChatMessage } from 'uiSrc/slices/interfaces/aiAssistant'

import { AssistanceEmptyHistoryText } from '../empty-history/texts'
import ChatHistory from '../chat-history'
import ChatForm from '../chat-form'
import { SUGGESTIONS } from '../../constants'

import styles from './styles.module.scss'

const AssistanceChat = () => {
  const { id, messages } = useSelector(aiAssistantChatSelector)

  const [progressingMessage, setProgressingMessage] = useState<Nullable<AiChatMessage>>(null)
  const scrollDivRef: Ref<HTMLDivElement> = useRef(null)

  const dispatch = useDispatch()

  useEffect(() => {
    if (!id || messages.length) {
      scrollToBottom('auto')
      return
    }

    dispatch(getAssistantChatHistoryAction(id, () => scrollToBottom('auto')))
  }, [])

  const handleSubmit = (message: string) => {
    scrollToBottom('smooth')

    if (!id) {
      dispatch(createAssistantChatAction((chatId) => sendChatMessage(chatId, message)))
      return
    }

    sendChatMessage(id, message)
  }

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
  }

  const onClearSession = () => {
    dispatch(removeAssistantChatAction(id))

    sendEventTelemetry({
      event: TelemetryEvent.AI_CHAT_SESSION_RESTARTED,
    })
  }

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    requestAnimationFrame(() => {
      scrollIntoView(scrollDivRef?.current, {
        behavior,
        block: 'start',
        inline: 'start',
      })
    })
  }

  return (
    <div className={styles.wrapper} data-testid="ai-general-chat">
      <div className={styles.header}>
        <span />
        <EuiButtonEmpty
          disabled={!!progressingMessage || !messages?.length}
          iconType="eraser"
          size="xs"
          onClick={onClearSession}
          className={styles.startSessionBtn}
          data-testid="ai-general-restart-session-btn"
        >
          Restart Session
        </EuiButtonEmpty>
      </div>
      <div className={styles.chatHistory}>
        <ChatHistory
          suggestions={SUGGESTIONS}
          welcomeText={AssistanceEmptyHistoryText}
          isLoadingAnswer={progressingMessage?.content === ''}
          progressingMessage={progressingMessage}
          history={messages}
          scrollDivRef={scrollDivRef}
          onMessageRendered={scrollToBottom}
          onSubmit={handleSubmit}
        />
      </div>
      <div className={styles.chatForm}>
        <ChatForm isDisabled={!!progressingMessage} onSubmit={handleSubmit} />
      </div>
    </div>
  )
}

export default AssistanceChat
