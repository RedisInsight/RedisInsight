import React from 'react'
import { EuiImage, EuiSpacer, EuiText, EuiTitle } from '@elastic/eui'
import AiRobotImg from 'uiSrc/assets/img/ai/ai-robot.svg'

import { OAuthSocial } from 'uiSrc/components'
import styles from './styles.module.scss'

const WelcomeAiAssistant = () => (
  <div className={styles.wrapper}>
    <EuiText style={{ lineHeight: '1.35' }}>
      Hi! I am your AI assistant, here to help you be more productive. #YourNewRedisBFF
    </EuiText>
    <EuiSpacer size="s" />
    <EuiText style={{ lineHeight: '1.35' }}>
      Ask me questions about Redis or get specialized expertise related
      to your data such as help with building secondary indexing queries.
    </EuiText>

    <EuiSpacer size="l" />
    <EuiImage src={AiRobotImg} alt="ai chat" />
    <EuiSpacer size="l" />

    <EuiTitle size="xs"><h5 style={{ marginBottom: '-18px' }}>Sign in to start asking questions.</h5></EuiTitle>
    <OAuthSocial hideTitle />
  </div>
)

export default WelcomeAiAssistant
