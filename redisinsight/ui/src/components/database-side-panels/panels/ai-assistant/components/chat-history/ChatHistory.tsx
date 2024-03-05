import React from 'react'
import cx from 'classnames'

import { AiChatMessage, AiChatMessageType, AiChatType } from 'uiSrc/slices/interfaces/aiAssistant'
import MarkdownMessage from 'uiSrc/components/database-side-panels/panels/ai-assistant/components/markdown-message'
import { Nullable } from 'uiSrc/utils'
import { AdditionalRedisModule } from 'apiSrc/modules/database/models/additional.redis.module'
import EmptyHistoryScreen from '../empty-history'
import LoadingMessage from '../loading-message'

import styles from './styles.module.scss'

export interface Props {
  modules?: AdditionalRedisModule[]
  type?: AiChatType
  progressingMessage?: Nullable<AiChatMessage>
  isLoadingAnswer?: boolean
  history: Array<AiChatMessage>
  scrollDivRef: React.Ref<HTMLDivElement>
  onMessageRendered?: () => void
  onSubmit: (value: string) => void
}

const ChatHistory = (props: Props) => {
  const {
    modules,
    type = AiChatType.Assistance,
    progressingMessage,
    isLoadingAnswer,
    history,
    scrollDivRef,
    onMessageRendered,
    onSubmit,
  } = props

  const getMessage = ({ type: messageType, content, id }: AiChatMessage) => (content ? (
    <div
      key={id}
      className={cx('jsx-markdown', {
        [styles.answer]: messageType === AiChatMessageType.AIMessage,
        [styles.question]: messageType === AiChatMessageType.HumanMessage,
      })}
    >
      <MarkdownMessage
        onMessageRendered={onMessageRendered}
        type={type}
        modules={modules}
      >
        {content}
      </MarkdownMessage>
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
