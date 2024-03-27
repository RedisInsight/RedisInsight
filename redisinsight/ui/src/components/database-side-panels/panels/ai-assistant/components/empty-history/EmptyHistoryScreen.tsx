import React from 'react'
import { EuiImage, EuiSpacer } from '@elastic/eui'
import AiChatImg from 'uiSrc/assets/img/ai/ai-chat.svg'

import { AiChatSuggestion } from '../../constants'
import styles from './styles.module.scss'

export interface Props {
  suggestions?: AiChatSuggestion[]
  welcomeText?: React.ReactNode
  onSubmit?: (value: string) => void
}

const EmptyHistoryScreen = (props: Props) => {
  const { suggestions, welcomeText, onSubmit } = props

  return (
    <div className={styles.welcome} data-testid="empty-chat-container">
      <div className={styles.welcomeText}>
        <EuiImage src={AiChatImg} alt="chat" />
        <EuiSpacer size="l" />
        {welcomeText}
      </div>
      {suggestions?.length && (
        <div className={styles.suggestions}>
          {suggestions.map((item, i) => (
            <div
              // eslint-disable-next-line react/no-array-index-key
              key={`suggestion_${i}`}
              className={styles.suggestion}
              onClick={() => onSubmit?.(item.query)}
              role="presentation"
              data-testid={`ai-chat-suggestion_${i}`}
            >
              {item.inner}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default EmptyHistoryScreen
