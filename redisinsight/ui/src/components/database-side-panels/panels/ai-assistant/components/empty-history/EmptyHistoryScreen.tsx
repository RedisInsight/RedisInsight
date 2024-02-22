import React from 'react'
import { EuiImage, EuiSpacer, EuiTitle } from '@elastic/eui'
import AiChatImg from 'uiSrc/assets/img/ai/redis-ai-chat.png'
import { SUGGESTIONS } from '../../constants'

import styles from './styles.module.scss'

export interface Props {
  onSubmit: (value: string) => void
}

const EmptyHistoryScreen = (props: Props) => {
  const { onSubmit } = props
  return (
    <div className={styles.welcome}>
      <div className={styles.welcomeText}>
        <EuiImage src={AiChatImg} alt="chat" />
        <EuiSpacer size="l" />
        <EuiTitle size="s"><span>ASK A QUESTION ABOUT REDIS</span></EuiTitle>
      </div>
      <div className={styles.suggestions}>
        {SUGGESTIONS.map((item, i) => (
          <div
            // eslint-disable-next-line react/no-array-index-key
            key={`suggestion_${i}`}
            className={styles.suggestion}
            onClick={() => onSubmit(item.query)}
            role="presentation"
          >
            {item.inner}
          </div>
        ))}
      </div>
    </div>
  )
}

export default EmptyHistoryScreen
