import React from 'react'
import { EuiFlexGroup, EuiFlexItem, EuiText, EuiTitle } from '@elastic/eui'
import { useDispatch } from 'react-redux'
import {
  OAuthAdvantages,
  OAuthAgreement,
  OAuthSocialButtons
} from 'uiSrc/components/oauth/shared'
import { OAuthSocialAction, OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { setSSOFlow } from 'uiSrc/slices/instances/cloud'
import { Nullable } from 'uiSrc/utils'

import styles from './styles.module.scss'

export interface Props {
  source?: Nullable<OAuthSocialSource>
  action?: OAuthSocialAction
}

const OAuthSignIn = (props: Props) => {
  const { source, action = OAuthSocialAction.SignIn } = props

  const dispatch = useDispatch()

  const handleSocialButtonClick = (accountOption: string) => {
    dispatch(setSSOFlow(action))
    sendEventTelemetry({
      event: TelemetryEvent.CLOUD_SIGN_IN_SOCIAL_ACCOUNT_SELECTED,
      eventData: {
        accountOption,
        action,
        source
      }
    })
  }

  return (
    <div className={styles.container} data-testid="oauth-container-signIn">
      <EuiFlexGroup gutterSize="none" responsive={false}>
        <EuiFlexItem className={styles.advantagesContainer}>
          <OAuthAdvantages />
        </EuiFlexItem>
        <EuiFlexItem className={styles.socialContainer}>
          <EuiText className={styles.subTitle}>Sign-up to</EuiText>
          <EuiTitle className={styles.title}><h2>Redis Cloud account</h2></EuiTitle>
          <OAuthSocialButtons
            className={styles.socialButtons}
            onClick={handleSocialButtonClick}
            action={action}
          />
          <OAuthAgreement />
        </EuiFlexItem>
      </EuiFlexGroup>
    </div>
  )
}

export default OAuthSignIn
