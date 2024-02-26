import React, { useCallback } from 'react'
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiModal,
  EuiModalBody,
  EuiText,
  EuiTitle,
} from '@elastic/eui'
import { useDispatch, useSelector } from 'react-redux'

import { OAuthSocial, OAuthSocialType } from 'uiSrc/components'
import { setSignInDialogState, oauthCloudSelector } from 'uiSrc/slices/oauth/cloud'

import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import { cloudSelector } from 'uiSrc/slices/instances/cloud'
import { OAuthAdvantages } from './constants'
import styles from './styles.module.scss'

const OAuthSignInDialog = () => {
  const { isOpenSignInDialog } = useSelector(oauthCloudSelector)
  const { ssoFlow } = useSelector(cloudSelector)

  const isAutodiscoverySSO = ssoFlow === 'import'

  const dispatch = useDispatch()

  const handleOnClose = useCallback(() => {
    sendEventTelemetry({
      event: TelemetryEvent.CLOUD_SIGN_IN_FORM_CLOSED,
      eventData: {
        action: isAutodiscoverySSO ? 'import' : 'create',
      }
    })
    dispatch(setSignInDialogState(null))
  }, [isAutodiscoverySSO])

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
                  {icon && (<EuiIcon type={icon} className={styles.advantageIcon} />)}
                  <EuiText>
                    <div className={styles.advantageTitle}>{title}</div>
                    <ul className={styles.advantageList}>
                      {text.map((item, i) => (
                        <li key={i} className={styles.advantageText}>{item}</li>
                      ))}
                    </ul>
                  </EuiText>
                </EuiText>
              ))}
            </div>
          </EuiFlexItem>
          <EuiFlexItem grow={false} className={styles.social}>
            <EuiTitle size="s">
              <h3 className={styles.title}>Get your free Cloud instance</h3>
            </EuiTitle>
            <EuiText color="subdued" size="xs">
              Use Redis as an all-in-one database <br /> and cache like never before
            </EuiText>
            <h4 className={styles.socialSubTitle}>Sign up with</h4>
            <OAuthSocial type={OAuthSocialType.Create} />
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiModalBody>
    </EuiModal>
  )
}

export default OAuthSignInDialog
