import React from 'react'
import cx from 'classnames'

import { EuiIcon, EuiText } from '@elastic/eui'
import { AiChatType, AiTool } from 'uiSrc/slices/interfaces/aiAssistant'
import { AdditionalRedisModule } from 'apiSrc/modules/database/models/additional.redis.module'

import MarkdownMessage from '../../markdown-message'
import ErrorMessage from '../../error-message'

import ChatbotAvatar from '../../chatbot-avatar/ChatbotAvatar'
import { AiQuestionMessageProps } from '../ai-question-message/AiQuestionMessage'
import styles from '../styles.module.scss'

export interface AiAnswerMessageProps extends AiQuestionMessageProps{
  onRunCommand?: (query: string) => void
  modules?: AdditionalRedisModule[]
  onMessageRendered?: () => void
}

const AiAnswerMessage = ({
  message,
  onRunCommand,
  onMessageRendered,
  modules,
  onRestart
}: AiAnswerMessageProps) => {
  const { id, content, error, type, tool } = message
  const botType = tool === AiTool.Query ? 'Query Builder' : 'General Redis'

  return (
    <React.Fragment key={id}>
      <div className={styles.answerWrapper}>
        <div className={styles.avatarWrapper}>
          <ChatbotAvatar type={tool} />
        </div>
        <div>
          <EuiText className={styles.aiBotNameText}>{botType}</EuiText>
          <div
            className={cx('jsx-markdown', styles.answer, { [styles.error]: !!error })}
            data-testid={`ai-message-${type}_${id}`}
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
      </div>
      <ErrorMessage error={error} onRestart={onRestart} />
    </React.Fragment>
  )
}

export default React.memo(AiAnswerMessage)
