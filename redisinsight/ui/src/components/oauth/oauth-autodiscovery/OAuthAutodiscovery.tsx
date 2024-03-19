import React, { useState } from 'react'
import cx from 'classnames'
import { EuiButton, EuiButtonIcon, EuiText, EuiToolTip } from '@elastic/eui'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { find } from 'lodash'
import { OAuthAgreement } from 'uiSrc/components'
import { ipcAuthGithub, ipcAuthGoogle } from 'uiSrc/electron/utils'
import {
  oauthCloudPAgreementSelector,
  oauthCloudUserSelector,
  setOAuthCloudSource,
  signIn
} from 'uiSrc/slices/oauth/cloud'
import { fetchSubscriptionsRedisCloud, setSSOFlow } from 'uiSrc/slices/instances/cloud'
import { OAuthSocialAction, OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import { ReactComponent as GoogleSmallIcon } from 'uiSrc/assets/img/oauth/google_small.svg'
import { ReactComponent as GithubSmallIcon } from 'uiSrc/assets/img/oauth/github_small.svg'

import { Pages } from 'uiSrc/constants'
import styles from './styles.module.scss'

export interface Props {
  source?: OAuthSocialSource
}

const OAuthAutodiscovery = (props: Props) => {
  const { source = OAuthSocialSource.Autodiscovery } = props
  const { data } = useSelector(oauthCloudUserSelector)
  const agreement = useSelector(oauthCloudPAgreementSelector)

  const [isDiscoverDisabled, setIsDiscoverDisabled] = useState(false)

  const dispatch = useDispatch()
  const history = useHistory()

  const handleClickDiscover = () => {
    dispatch(setSSOFlow(OAuthSocialAction.Import))
    setIsDiscoverDisabled(true)
    dispatch(fetchSubscriptionsRedisCloud(
      null,
      true,
      () => {
        history.push(Pages.redisCloudSubscriptions)
        setIsDiscoverDisabled(false)
      },
      () => setIsDiscoverDisabled(false)
    ))

    sendEventTelemetry({
      event: TelemetryEvent.CLOUD_IMPORT_DATABASES_SUBMITTED,
      eventData: {
        source
      }
    })
  }

  if (data) {
    const { accounts, currentAccountId } = data
    const currentAccountName = find(accounts, ({ id }) => id === currentAccountId)

    return (
      <div
        className={styles.container}
        data-testid="oauth-container-import"
      >
        <EuiText className={styles.text} color="subdued">
          Use
          {' '}
          <strong>{currentAccountName?.name} #{currentAccountId}</strong>
          {' '}
          account to auto-discover subscriptions and add your databases.
        </EuiText>
        <EuiButton
          fill
          color="secondary"
          onClick={handleClickDiscover}
          disabled={isDiscoverDisabled}
          data-testid="oauth-discover-btn"
        >
          Discover
        </EuiButton>
      </div>
    )
  }

  const sendTelemetry = (accountOption: string) => sendEventTelemetry({
    event: TelemetryEvent.CLOUD_SIGN_IN_SOCIAL_ACCOUNT_SELECTED,
    eventData: {
      accountOption,
      action: OAuthSocialAction.Import,
    }
  })

  const handleClickSso = () => {
    dispatch(signIn())
    dispatch(setSSOFlow(OAuthSocialAction.Import))
    dispatch(setOAuthCloudSource(source))
  }

  const socialLinks = [
    {
      className: styles.googleButton,
      icon: GoogleSmallIcon,
      label: 'google-oauth',
      onButtonClick: () => {
        sendTelemetry('Google')
        ipcAuthGoogle(OAuthSocialAction.Import)
      },
    },
    {
      icon: GithubSmallIcon,
      label: 'github-oauth',
      className: styles.githubButton,
      onButtonClick: () => {
        sendTelemetry('GitHub')
        ipcAuthGithub(OAuthSocialAction.Import)
      },
    }
  ]

  const buttons = socialLinks.map(({ icon, label, className = '', onButtonClick }) => (
    <EuiToolTip
      key={label}
      position="top"
      anchorClassName={!agreement ? 'euiToolTip__btn-disabled' : ''}
      content={agreement ? null : 'Acknowledge the agreement'}
      data-testid={`${label}-tooltip`}
    >
      <EuiButtonIcon
        iconType={icon}
        disabled={!agreement}
        className={cx(styles.button, className)}
        onClick={() => {
          handleClickSso()
          onButtonClick()
        }}
        data-testid={label}
        aria-labelledby={label}
      />
    </EuiToolTip>
  ))

  return (
    <div
      className={styles.container}
      data-testid="oauth-container-import"
    >
      <EuiText className={styles.text} color="subdued">
        Auto-discover subscriptions and add your databases.
        <br />
        A new Redis Cloud account will be created for you if you don’t have one.
      </EuiText>
      <div className={styles.buttonsContainer}>
        {buttons}
      </div>
      <div className={styles.containerAgreement}>
        <OAuthAgreement />
      </div>
    </div>
  )
}

export default OAuthAutodiscovery
