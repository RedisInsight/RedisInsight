import React, { useCallback } from 'react'
import cx from 'classnames'

import { AiChatMessage, AiChatMessageType } from 'uiSrc/slices/interfaces/aiAssistant'
import { Nullable } from 'uiSrc/utils'

import { AdditionalRedisModule } from 'apiSrc/modules/database/models/additional.redis.module'
import EmptyHistoryScreen from '../empty-history'
import LoadingMessage from '../loading-message'
import MarkdownMessage from '../markdown-message'
import { AiChatSuggestion } from '../../constants'

import styles from './styles.module.scss'

export interface Props {
  suggestions?: AiChatSuggestion[]
  welcomeText?: React.ReactNode
  progressingMessage?: Nullable<AiChatMessage>
  isLoadingAnswer?: boolean
  modules?: AdditionalRedisModule[]
  history: AiChatMessage[]
  scrollDivRef: React.Ref<HTMLDivElement>
  onMessageRendered?: () => void
  onRunCommand?: (query: string) => void
  onSubmit: (value: string) => void
}

const ChatHistory = (props: Props) => {
  const {
    suggestions,
    welcomeText,
    progressingMessage,
    isLoadingAnswer,
    modules,
    history = [],
    scrollDivRef,
    onMessageRendered,
    onRunCommand,
    onSubmit,
  } = props

  const getMessage = useCallback(({ type: messageType, content, id }: AiChatMessage) => (content ? (
    <div
      key={id}
      className={cx('jsx-markdown', {
        [styles.answer]: messageType === AiChatMessageType.AIMessage,
        [styles.question]: messageType === AiChatMessageType.HumanMessage,
      })}
      data-testid={`ai-message-${messageType}_${id}`}
    >
      <MarkdownMessage
        onRunCommand={onRunCommand}
        onMessageRendered={onMessageRendered}
        modules={modules}
      >
        {content}
      </MarkdownMessage>
    </div>
  ) : null), [modules])

  if (history.length === 0) {
    return (
      <EmptyHistoryScreen
        welcomeText={welcomeText}
        suggestions={suggestions}
        onSubmit={onSubmit}
      />
    )
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.history} data-testid="ai-chat-history">
        {history.map(getMessage)}
        {!!progressingMessage && getMessage(progressingMessage)}
        {isLoadingAnswer && (<div className={styles.answer} data-testid="ai-loading-answer"><LoadingMessage /></div>)}
        <div ref={scrollDivRef} />
      </div>
    </div>
  )
}

export default React.memo(ChatHistory)
