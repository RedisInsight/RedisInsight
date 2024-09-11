import React, { MutableRefObject, Ref, useCallback, useEffect, useRef, useState } from 'react'
import cx from 'classnames'

import { EuiIcon, EuiLoadingSpinner, EuiText } from '@elastic/eui'
import { throttle } from 'lodash'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { AiChatMessage, AiChatMessageType, BotType } from 'uiSrc/slices/interfaces/aiAssistant'
import { Nullable, findTutorialPath, isRedisearchAvailable, scrollIntoView } from 'uiSrc/utils'
// import LogoSVG from 'uiSrc/assets/img/logo_small.svg?react'
import { fetchRedisearchListAction } from 'uiSrc/slices/browser/redisearch'
import { SAMPLE_DATA_TUTORIAL } from 'uiSrc/constants'
import { openTutorialByPath } from 'uiSrc/slices/panels/sidePanels'
import { TELEMETRY_EMPTY_VALUE, TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import { AdditionalRedisModule } from 'apiSrc/modules/database/models/additional.redis.module'

import { AssistanceChatInitialMessage } from './texts'
import LoadingMessage from '../loading-message'
import MarkdownMessage from '../markdown-message'
import ErrorMessage from '../error-message'

import ChatbotAvatar from '../chatbot-avatar/ChatbotAvatar'
import UserAvatar from '../user-avatar/UserAvatar'
import NoIndexesInitialMessage from '../ai-messages/no-indexes-initial-message'
import { EXPERT_CHAT_INITIAL_MESSAGE } from '../../texts'
import AiQuestionMessage from '../ai-messages/ai-question-message'
import AiAnswerMessage from '../ai-messages/ai-answer-message'
import styles from './styles.module.scss'

export interface Props {
  autoScroll?: boolean
  isLoading?: boolean
  // initialMessage: React.ReactNode
  inProgressMessage?: Nullable<AiChatMessage>
  modules?: AdditionalRedisModule[]
  history: AiChatMessage[]
  onMessageRendered?: () => void
  onRunCommand?: (query: string) => void
  onRestart: () => void
  dbId: Nullable<string>
}

const SCROLL_THROTTLE_MS = 200

const ChatHistory = (props: Props) => {
  const {
    autoScroll,
    isLoading,
    // initialMessage,
    inProgressMessage,
    modules,
    history = [],
    onMessageRendered,
    onRunCommand,
    onRestart,
    dbId,
  } = props

  const scrollDivRef: Ref<HTMLDivElement> = useRef(null)
  const listRef: Ref<HTMLDivElement> = useRef(null)
  const observerRef: MutableRefObject<Nullable<MutationObserver>> = useRef(null)
  const scrollBehavior = useRef<ScrollBehavior>('auto')

  const [isNoIndexes, setIsNoIndexes] = useState(false)
  const dispatch = useDispatch()
  const routerHistory = useHistory()

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

  useEffect(() => {
    if (!dbId) return
    if (!isRedisearchAvailable(modules)) return
    if (history.length) return

    getIndexes()
  }, [dbId, modules])

  const getIndexes = () => {
    // setIsLoading(true)
    dispatch(
      fetchRedisearchListAction(
        (indexes) => {
          // setIsLoading(false)
          setIsNoIndexes(!indexes.length)
        },
        // () => setIsLoading(false),
        undefined,
        false
      )
    )
  }

  const handleClickTutorial = () => {
    const tutorialPath = findTutorialPath({ id: SAMPLE_DATA_TUTORIAL })
    dispatch(openTutorialByPath(tutorialPath, routerHistory, true))

    sendEventTelemetry({
      event: TelemetryEvent.EXPLORE_PANEL_TUTORIAL_OPENED,
      eventData: {
        databaseId: dbId || TELEMETRY_EMPTY_VALUE,
        source: 'sample_data',
      }
    })
  }

  const getInitialMessage = () => {
    if (!dbId) return AssistanceChatInitialMessage
    return isNoIndexes ? <NoIndexesInitialMessage onClickTutorial={handleClickTutorial} onSuccess={getIndexes} />
      : EXPERT_CHAT_INITIAL_MESSAGE
  }

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
              <ChatbotAvatar type={BotType.General} />
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
                {getInitialMessage()}
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
