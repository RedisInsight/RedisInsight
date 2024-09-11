import React from 'react'
import cx from 'classnames'

import { EuiIcon } from '@elastic/eui'
import { AiChatMessage, BotType } from 'uiSrc/slices/interfaces/aiAssistant'
import ErrorMessage from '../../error-message'

import UserAvatar from '../../user-avatar/UserAvatar'
import styles from '../styles.module.scss'

export interface AiQuestionMessageProps {
  message: AiChatMessage
  onRestart: () => void
}

const AiQuestionMessage = ({ message, onRestart }: AiQuestionMessageProps) => {
  const { id, content, error, tool, type } = message

  const messageContent = tool === BotType.Query ? `/query ${content}` : content
  return (
    <React.Fragment key={id}>
      <div className={styles.questionWrapper}>
        <div
          className={cx('jsx-markdown', styles.question, { [styles.error]: !!error })}
          data-testid={`ai-message-${type}_${id}`}
        >
          {error && (<EuiIcon type="alert" className={styles.errorIcon} />)}
          {messageContent}
        </div>
        <UserAvatar />
      </div>
      <ErrorMessage error={error} onRestart={onRestart} />
    </React.Fragment>
  )
}

export default React.memo(AiQuestionMessage)
