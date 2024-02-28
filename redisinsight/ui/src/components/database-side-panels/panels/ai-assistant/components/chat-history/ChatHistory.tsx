import React from 'react'
import cx from 'classnames'

import { AiChatMessage, AiChatMessageType, AiChatType } from 'uiSrc/slices/interfaces/aiAssistant'
import MarkdownMessage from 'uiSrc/components/database-side-panels/panels/ai-assistant/components/markdown-message'
import { Nullable } from 'uiSrc/utils'
import EmptyHistoryScreen from '../empty-history'
import LoadingMessage from '../loading-message'

import styles from './styles.module.scss'

export interface Props {
  type?: AiChatType
  progressingMessage?: Nullable<AiChatMessage>
  isLoadingAnswer?: boolean
  history: Array<AiChatMessage>
  scrollDivRef: React.Ref<HTMLDivElement>
  onSubmit: (value: string) => void
}

const ChatHistory = (props: Props) => {
  const {
    type = AiChatType.Assistance,
    progressingMessage,
    isLoadingAnswer,
    history,
    scrollDivRef,
    onSubmit
  } = props

  const getMessage = ({ type, content, id }: AiChatMessage) => (content ? (
    <div
      key={id}
      className={cx('jsx-markdown', {
        [styles.answer]: type === AiChatMessageType.AIMessage,
        [styles.question]: type === AiChatMessageType.HumanMessage,
      })}
    >
      <MarkdownMessage>{content}</MarkdownMessage>
    </div>
  ) : null)

  if (history.length === 0) return (<EmptyHistoryScreen type={type} onSubmit={onSubmit} />)

  return (
    <div className={styles.wrapper}>
      <div className={styles.history}>
        {history.map(getMessage)}
        {!!progressingMessage && getMessage(progressingMessage)}
        {isLoadingAnswer && (<div className={styles.answer}><LoadingMessage /></div>)}
        <div ref={scrollDivRef} />
      </div>
    </div>
  )
}

export default ChatHistory
