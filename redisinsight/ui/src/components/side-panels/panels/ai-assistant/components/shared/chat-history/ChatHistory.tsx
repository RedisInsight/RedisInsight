import React, { useCallback } from 'react'
import cx from 'classnames'

import { EuiIcon, EuiLoadingSpinner } from '@elastic/eui'
import { AiChatMessage, AiChatMessageType } from 'uiSrc/slices/interfaces/aiAssistant'
import { Nullable } from 'uiSrc/utils'
import { AdditionalRedisModule } from 'apiSrc/modules/database/models/additional.redis.module'

import LoadingMessage from '../loading-message'
import MarkdownMessage from '../markdown-message'
import ErrorMessage from '../error-message'

import styles from './styles.module.scss'

export interface Props {
  isLoading?: boolean
  initialMessage: React.ReactNode
  inProgressMessage?: Nullable<AiChatMessage>
  modules?: AdditionalRedisModule[]
  history: AiChatMessage[]
  scrollDivRef: React.Ref<HTMLDivElement>
  onMessageRendered?: () => void
  onRunCommand?: (query: string) => void
  onRestart: () => void
}

const ChatHistory = (props: Props) => {
  const {
    isLoading,
    initialMessage,
    inProgressMessage,
    modules,
    history = [],
    scrollDivRef,
    onMessageRendered,
    onRunCommand,
    onRestart
  } = props

  const getMessage = useCallback((message?: Nullable<AiChatMessage>) => {
    if (!message) return null

    const { id, content, error, type: messageType } = message
    if (!content) return null

    return (
      <React.Fragment key={id}>
        <div
          className={cx({
            [styles.answerWrapper]: messageType === AiChatMessageType.AIMessage,
            [styles.questionWrapper]: messageType === AiChatMessageType.HumanMessage,
          })}
        >
          <div
            className={cx('jsx-markdown', {
              [styles.answer]: messageType === AiChatMessageType.AIMessage,
              [styles.question]: messageType === AiChatMessageType.HumanMessage,
              [styles.error]: !!error
            })}
            data-testid={`ai-message-${messageType}_${id}`}
          >
            {error && (<EuiIcon type="alert" className={styles.errorIcon} />)}
            <MarkdownMessage
              onRunCommand={onRunCommand}
              onMessageRendered={onMessageRendered}
              modules={modules}
            >
              {content}
            </MarkdownMessage>
          </div>
        </div>
        <ErrorMessage error={error} onRestart={onRestart} />
      </React.Fragment>
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
              className={styles.answer}
              data-testid="ai-message-initial-message"
            >
              {initialMessage}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const { content } = inProgressMessage || {}

  return (
    <div className={styles.wrapper}>
      <div className={styles.history} data-testid="ai-chat-history">
        {history.map(getMessage)}
        {getMessage(inProgressMessage)}
        {content === '' && (
          <div className={styles.answerWrapper}>
            <div className={styles.answer} data-testid="ai-loading-answer"><LoadingMessage /></div>
          </div>
        )}
        <div ref={scrollDivRef} />
      </div>
    </div>
  )
}

export default React.memo(ChatHistory)
