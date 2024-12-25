import React from 'react'
import { EuiSpacer, EuiText, EuiTitle } from '@elastic/eui'
import { useDispatch } from 'react-redux'
import { OAuthAgreement } from 'uiSrc/components/oauth/shared'

import { OAuthSocialAction, OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { setSSOFlow } from 'uiSrc/slices/instances/cloud'
import { setOAuthCloudSource } from 'uiSrc/slices/oauth/cloud'
import OAuthForm from 'uiSrc/components/oauth/shared/oauth-form'
import styles from './styles.module.scss'

const WelcomeAiAssistant = () => {
  const dispatch = useDispatch()

  const handleSsoClick = (accountOption: string) => {
    dispatch(setSSOFlow(OAuthSocialAction.SignIn))
    dispatch(setOAuthCloudSource(OAuthSocialSource.AiChat))

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
      <div className={styles.container}>
        <OAuthForm
          action={OAuthSocialAction.SignIn}
          onClick={handleSsoClick}
        >
          {(form: React.ReactNode) => (
            <>
              <EuiText style={{ lineHeight: '1.35' }}>Welcome to Redis Copilot.</EuiText>
              <EuiSpacer size="s" />
              <EuiText style={{ lineHeight: '1.35' }}>Learn about Redis and explore your data, in a conversational manner.</EuiText>
              <EuiSpacer size="s" />
              <EuiText style={{ lineHeight: '1.35' }}>Build faster with Redis Copilot.</EuiText>
              <EuiSpacer size="xl" />
              <EuiTitle size="xs"><h5>Sign in to get started.</h5></EuiTitle>

              <EuiSpacer size="l" />
              {form}
              <EuiSpacer />
              <div className={styles.agreement}>
                <OAuthAgreement />
              </div>
            </>
          )}
        </OAuthForm>
      </div>
    </div>
  )
}

export default WelcomeAiAssistant
