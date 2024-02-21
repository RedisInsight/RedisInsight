import React from 'react'
import cx from 'classnames'
import { EuiMarkdownFormat } from '@elastic/eui'

import { AiChatMessage, AiChatMessageType } from 'uiSrc/slices/interfaces/aiAssistant'
import { processingMarkdownPlugins } from '../../utils'
import EmptyHistoryScreen from '../empty-history'
import LoadingMessage from '../loading-message'

import styles from './styles.module.scss'

export interface Props {
  progressingMessage?: any
  history: Array<AiChatMessage>
  scrollDivRef: React.Ref<HTMLDivElement>
  onSubmit: (value: string) => void
}

const ChatHistory = (props: Props) => {
  const { progressingMessage, history, scrollDivRef, onSubmit } = props

  const getMessage = ({ type, content, id }: AiChatMessage) => (
    <div
      key={id}
      className={cx({
        [styles.answer]: type === AiChatMessageType.AIMessage,
        [styles.question]: type === AiChatMessageType.HumanMessage,
      })}
    >
      {content ? (
        <EuiMarkdownFormat processingPluginList={processingMarkdownPlugins}>{content}</EuiMarkdownFormat>
      ) : (<LoadingMessage />)}
    </div>
  )

  if (history.length === 0) return (<EmptyHistoryScreen onSubmit={onSubmit} />)

  return (
    <div className={styles.wrapper}>
      <div className={styles.history}>
        {history.map(getMessage)}
        {!!progressingMessage && getMessage(progressingMessage)}
        <div ref={scrollDivRef} />
      </div>
    </div>
  )
}

export default ChatHistory
