import React, { useCallback } from 'react'
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiLink,
  EuiModal,
  EuiModalBody,
  EuiText,
  EuiTitle,
} from '@elastic/eui'
import { useDispatch, useSelector } from 'react-redux'

import { OAuthSocial } from 'uiSrc/components'
import { setSignInDialogState, oauthCloudSelector } from 'uiSrc/slices/oauth/cloud'
import { ReactComponent as DeveloperIcon } from 'uiSrc/assets/img/oauth/developer.svg'

import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import { OAuthAdvantages } from './constants'
import styles from './styles.module.scss'

const OAuthSignInDialog = () => {
  const { isOpenSignInDialog } = useSelector(oauthCloudSelector)

  const dispatch = useDispatch()

  const handleOnClose = useCallback(() => {
    sendEventTelemetry({
      event: TelemetryEvent.CLOUD_SIGN_IN_FORM_CLOSED,
    })
    dispatch(setSignInDialogState(null))
  }, [])

  if (!isOpenSignInDialog) return null

  return (
    <EuiModal className={styles.content} onClose={handleOnClose} data-testid="oauth-sign-in-dialog">
      <EuiModalBody className={styles.modalBody}>
        <EuiFlexGroup gutterSize="none" className={styles.flexGroup}>
          <EuiFlexItem grow={false} className={styles.advantages}>
            <div className={styles.advantagesContent}>
              <EuiTitle size="s">
                <h3 className={styles.title}>Get started with Redis Cloud</h3>
              </EuiTitle>
              {OAuthAdvantages.map(({ icon, text, title }) => (
                <EuiText className={styles.advantage} key={text?.toString()}>
                  <EuiIcon type={icon} className={styles.advantageIcon} />
                  <EuiText>
                    <div className={styles.advantageTitle}>{title}</div>
                    <div className={styles.advantageText}>{text}</div>
                  </EuiText>
                </EuiText>
              ))}
            </div>

            <EuiIcon type={DeveloperIcon} className={styles.developerIcon} />

          </EuiFlexItem>
          <EuiFlexItem grow={false} className={styles.social}>
            <EuiTitle size="s">
              <h3 className={styles.title}>Create a free Cloud database</h3>
            </EuiTitle>
            <h4 className={styles.socialSubTitle}>Sign in with</h4>
            <OAuthSocial />
            <EuiText className={styles.socialText}>
              {'By signing up, you acknowledge that you agree to our '}
              <EuiLink
                external={false}
                href="https://redis.com/legal/cloud-tos/?utm_source=redisinsight&utm_medium=main&utm_campaign=main"
                target="_blank"
              >
                Cloud Terms of Service
              </EuiLink>
              {' and '}
              <EuiLink
                external={false}
                href="https://redis.com/legal/privacy-policy/?utm_source=redisinsight&utm_medium=main&utm_campaign=main"
                target="_blank"
              >
                Privacy Policy.
              </EuiLink>
            </EuiText>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiModalBody>
    </EuiModal>
  )
}

export default OAuthSignInDialog
