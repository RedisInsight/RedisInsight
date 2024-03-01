import React from 'react'
import { EuiSpacer, EuiText, EuiTitle } from '@elastic/eui'

import { OAuthSocial } from 'uiSrc/components'
import styles from './styles.module.scss'

const WelcomeAiAssistant = () => (
  <div className={styles.wrapper}>
    <EuiText style={{ lineHeight: '1.35' }}>
      Hi! I am your Redis Copilot, here to help you be more productive.
    </EuiText>
    <EuiSpacer size="s" />
    <EuiText style={{ lineHeight: '1.35' }}>
      Ask me questions about Redis or get specialized expertise in the context of your database.
    </EuiText>
    <EuiSpacer size="l" />
    <EuiTitle size="xs"><h5 style={{ marginBottom: '-18px' }}>Sign in to start asking questions.</h5></EuiTitle>
    <OAuthSocial hideTitle />
  </div>
)

export default WelcomeAiAssistant
