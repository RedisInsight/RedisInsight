import React from 'react'
import { EuiImage, EuiSpacer, EuiText } from '@elastic/eui'
import AiChatImg from 'uiSrc/assets/img/ai/ai-chat.svg'
import { AiChatType } from 'uiSrc/slices/interfaces/aiAssistant'
import { SUGGESTIONS } from '../../constants'

import styles from './styles.module.scss'

export interface Props {
  type?: AiChatType
  onSubmit: (value: string) => void
}

const EmptyHistoryScreen = (props: Props) => {
  const { type, onSubmit } = props

  const AssistanceText = (
    <>
      <EuiText size="xs">
        Feel free to engage in a conversation about Redis in
        General or type / for specialized expertise in the context of a Database.
      </EuiText>
      <EuiSpacer />
      <EuiText size="xs">
        With <span style={{ color: 'red' }}>&hearts;</span>, your Redis Copilot!
      </EuiText>
      <EuiSpacer size="xs" />
      <EuiText size="xs" color="subdued">
        <i>*I am powered by AI so errors can happen. Feedback welcome. Thank you!</i>
      </EuiText>
    </>
  )

  const ExpertText = (
    <>
      <EuiText size="xs">
        Type /query to generate a query based on your prompt.
      </EuiText>
      <EuiSpacer size="xs" />
      <EuiText size="xs">
        Stay tuned. We are working on adding more specialized expertise.
      </EuiText>
      <EuiSpacer />
      <EuiText size="xs">
        With <span style={{ color: 'red' }}>&hearts;</span>, your Redis Copilot!
      </EuiText>
      <EuiSpacer size="xs" />
      <EuiText size="xs" color="subdued">
        <i>*I am powered by AI so errors can happen. Feedback welcome. Thank you!</i>
      </EuiText>
    </>
  )

  return (
    <div className={styles.welcome}>
      <div className={styles.welcomeText}>
        <EuiImage src={AiChatImg} alt="chat" />
        <EuiSpacer size="l" />
        {type === AiChatType.Assistance ? AssistanceText : ExpertText}
      </div>
      {type === AiChatType.Assistance && (
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
      )}
    </div>
  )
}

export default EmptyHistoryScreen
