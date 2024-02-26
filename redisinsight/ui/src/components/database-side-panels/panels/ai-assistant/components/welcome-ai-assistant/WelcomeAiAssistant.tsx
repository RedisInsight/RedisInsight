import React from 'react'
import { EuiImage, EuiSpacer, EuiText, EuiTitle } from '@elastic/eui'
import AiRobotImg from 'uiSrc/assets/img/ai/ai-robot.svg'

import { OAuthSocial } from 'uiSrc/components'
import styles from './styles.module.scss'

const WelcomeAiAssistant = () => (
  <div className={styles.wrapper}>
    <EuiTitle><span>Use Redis AI expert</span></EuiTitle>
    <EuiSpacer size="m" />
    <EuiText color="subdued" style={{ lineHeight: '1.35' }}>
      Explore Redis effortlessly, starting now!
      <br />
      Ask any question and get instant answers with our powerful chatbot.
    </EuiText>

    <EuiSpacer size="l" />
    <EuiImage src={AiRobotImg} alt="ai chat" />
    <EuiSpacer size="l" />

    <EuiTitle size="xs"><h5 style={{ marginBottom: '-18px' }}>Sign in with</h5></EuiTitle>
    <OAuthSocial hideTitle />
  </div>
)

export default WelcomeAiAssistant
