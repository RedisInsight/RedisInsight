import React from 'react'
import { EuiSpacer, EuiText, EuiTitle } from '@elastic/eui'
import { useDispatch } from 'react-redux'
import { OAuthAgreement, OAuthSocialButtons } from 'uiSrc/components/oauth/shared'

import { OAuthSocialAction, OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { setSSOFlow } from 'uiSrc/slices/instances/cloud'
import styles from './styles.module.scss'

const WelcomeAiAssistant = () => {
  const dispatch = useDispatch()

  const handleSsoClick = (accountOption: string) => {
    dispatch(setSSOFlow(OAuthSocialAction.SignIn))
    sendEventTelemetry({
      event: TelemetryEvent.CLOUD_SIGN_IN_SOCIAL_ACCOUNT_SELECTED,
      eventData: {
        accountOption,
        action: OAuthSocialAction.SignIn,
        source: OAuthSocialSource.AiChat
      }
    })
  }

  return (
    <div className={styles.wrapper} data-testid="copilot-welcome">
      <EuiText style={{ lineHeight: '1.35' }}>
        Hi! I am your Redis Copilot, here to help you be more productive.
      </EuiText>
      <EuiSpacer size="s" />
      <EuiText style={{ lineHeight: '1.35' }}>
        Ask me questions about Redis or get specialized expertise in the context of your database.
      </EuiText>
      <EuiSpacer size="xl" />
      <EuiTitle size="xs"><h5>Sign in to start asking questions.</h5></EuiTitle>

      <EuiSpacer size="l" />
      <OAuthSocialButtons action={OAuthSocialAction.SignIn} onClick={handleSsoClick} />
      <EuiSpacer />
      <div className={styles.agreement}>
        <OAuthAgreement />
      </div>
    </div>
  )
}

export default WelcomeAiAssistant
