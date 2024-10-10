import React, { MutableRefObject, Ref, useCallback, useEffect, useRef } from 'react'
import cx from 'classnames'

import { EuiLoadingSpinner, EuiText } from '@elastic/eui'
import { throttle } from 'lodash'
import { AiChatMessage, AiChatMessageType, AiChatType } from 'uiSrc/slices/interfaces/aiAssistant'
import { Nullable, scrollIntoView } from 'uiSrc/utils'
import { AdditionalRedisModule } from 'apiSrc/modules/database/models/additional.redis.module'

import { AiChatInitialMessage } from './texts'
import LoadingMessage from '../loading-message'

import ChatbotAvatar from '../chatbot-avatar/ChatbotAvatar'
import AiQuestionMessage from '../ai-messages/ai-question-message'
import AiAnswerMessage from '../ai-messages/ai-answer-message'
import styles from './styles.module.scss'

export interface Props {
  autoScroll?: boolean
  isLoading?: boolean
  inProgressMessage?: Nullable<AiChatMessage>
  modules?: AdditionalRedisModule[]
  history: AiChatMessage[]
  onMessageRendered?: () => void
  onRunCommand?: (query: string) => void
  onRestart: () => void
}

const SCROLL_THROTTLE_MS = 200

const ChatHistory = (props: Props) => {
  const {
    autoScroll,
    isLoading,
    inProgressMessage,
    modules,
    history = [],
    onMessageRendered,
    onRunCommand,
    onRestart,
  } = props

  const scrollDivRef: Ref<HTMLDivElement> = useRef(null)
  const listRef: Ref<HTMLDivElement> = useRef(null)
  const observerRef: MutableRefObject<Nullable<MutationObserver>> = useRef(null)
  const scrollBehavior = useRef<ScrollBehavior>('auto')

  useEffect(() => {
    if (!autoScroll) return undefined
    if (!listRef.current) return undefined

    scrollBehavior.current = inProgressMessage ? 'smooth' : 'auto'

    if (!inProgressMessage) scrollToBottom()
    if (inProgressMessage?.content === '') scrollToBottomThrottled()

    if (!observerRef.current) {
      const observerCallback: MutationCallback = (mutationsList) => {
        // eslint-disable-next-line no-restricted-syntax
        for (const mutation of mutationsList) {
          if (mutation.type === 'childList') {
            scrollBehavior.current === 'smooth' ? scrollToBottomThrottled() : scrollToBottom()
            break
          }
        }
      }

      observerRef.current = new MutationObserver(observerCallback)
    }

    observerRef.current.observe(listRef.current, {
      childList: true,
      subtree: true,
    })

    return () => {
      observerRef.current?.disconnect()
    }
  }, [autoScroll, inProgressMessage, history])

  const scrollToBottom = (behavior: ScrollBehavior = 'auto') => {
    requestAnimationFrame(() => {
      scrollIntoView(scrollDivRef?.current, {
        behavior,
        block: 'start',
        inline: 'start',
      })
    })
  }
  const scrollToBottomThrottled = throttle(() => scrollToBottom('smooth'), SCROLL_THROTTLE_MS)

  const getMessage = useCallback((message?: Nullable<AiChatMessage>) => {
    if (!message) return null

    const { content, type: messageType } = message
    if (!content) return null

    return messageType === AiChatMessageType.HumanMessage ? (
      <AiQuestionMessage
        message={message}
        onRestart={onRestart}
      />
    ) : (
      <AiAnswerMessage
        message={message}
        onRestart={onRestart}
        onRunCommand={onRunCommand}
        modules={modules}
        onMessageRendered={onMessageRendered}
      />
    )
  }, [modules])

  if (isLoading) {
    return (
      <div className={cx(styles.wrapper, styles.loader)}>
        <EuiLoadingSpinner size="xl" data-testid="ai-loading-spinner" />
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.history} data-testid="ai-chat-empty-history">
          <div className={styles.answerWrapper}>
            <div
              className={styles.avatarWrapper}
            >
              <ChatbotAvatar type={AiChatType.General} />
            </div>
            <div>
              <EuiText
                color="subdued"
                className={styles.aiBotNameText}
              >Redis Bot
              </EuiText>
              <div
                className={styles.answer}
                data-testid="ai-message-initial-message"
              >
                {AiChatInitialMessage}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const { content } = inProgressMessage || {}

  return (
    <div className={styles.wrapper}>
      <div ref={listRef} className={styles.history} data-testid="ai-chat-history">
        {history.map(getMessage)}
        {getMessage(inProgressMessage)}
        {content === '' && (
          <div className={styles.answerWrapper}>
            <div className={styles.answer} data-testid="ai-loading-answer"><LoadingMessage /></div>
          </div>
        )}
        <div className={styles.scrollAnchor} ref={scrollDivRef} />
      </div>
    </div>
  )
}

export default React.memo(ChatHistory)
