import React from 'react'
import { EuiButtonIcon, EuiText, EuiTitle } from '@elastic/eui'
import cx from 'classnames'
import { useDispatch, useSelector } from 'react-redux'

import { ipcAuthGithub, ipcAuthGoogle } from 'uiSrc/electron/utils'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import { oauthCloudSelector, setOAuthCloudSource, signIn } from 'uiSrc/slices/oauth/cloud'

import { ReactComponent as GoogleIcon } from 'uiSrc/assets/img/oauth/google.svg'
import { ReactComponent as GithubIcon } from 'uiSrc/assets/img/oauth/github.svg'
import { ReactComponent as GoogleSmallIcon } from 'uiSrc/assets/img/oauth/google_small.svg'
import { ReactComponent as GithubSmallIcon } from 'uiSrc/assets/img/oauth/github_small.svg'

import { setIsAutodiscoverySSO } from 'uiSrc/slices/instances/cloud'
import { OAuthSocialSource } from 'uiSrc/slices/interfaces'
import styles from './styles.module.scss'

export enum OAuthSocialType {
  Modal = 'modal',
  Autodiscovery = 'Autodiscovery',
}

interface Props {
  type?: OAuthSocialType
}

const OAuthSocial = ({ type = OAuthSocialType.Modal }: Props) => {
  const dispatch = useDispatch()
  const isAutodiscovery = type === OAuthSocialType.Autodiscovery

  const getAction = () => (isAutodiscovery ? 'import' : 'create')

  const sendTelemetry = (accountOption: string) => sendEventTelemetry({
    event: TelemetryEvent.CLOUD_SIGN_IN_SOCIAL_ACCOUNT_SELECTED,
    eventData: {
      accountOption,
      action: getAction(),
    }
  })

  const socialLinks = [
    {
      className: styles.googleButton,
      icon: isAutodiscovery ? GoogleSmallIcon : GoogleIcon,
      label: 'google-oauth',
      onButtonClick: () => {
        sendTelemetry('Google')
        ipcAuthGoogle(getAction())
      },
    },
    {
      icon: isAutodiscovery ? GithubSmallIcon : GithubIcon,
      label: 'github-oauth',
      className: styles.githubButton,
      onButtonClick: () => {
        sendTelemetry('GitHub')
        ipcAuthGithub(getAction())
      },
    }
  ]

  const buttons = socialLinks.map(({ icon, label, className = '', onButtonClick }) => (
    <EuiButtonIcon
      key={label}
      iconType={icon}
      className={cx(styles.button, className)}
      onClick={() => {
        dispatch(signIn())
        dispatch(setIsAutodiscoverySSO(isAutodiscovery))
        isAutodiscovery && dispatch(setOAuthCloudSource(OAuthSocialSource.Autodiscovery))
        onButtonClick()
      }}
      data-testid={label}
      aria-labelledby={label}
    />
  ))

  if (!isAutodiscovery) {
    return (
      <div className={cx(styles.container)}>
        {buttons}
      </div>
    )
  }

  return (
    <div className={cx(styles.containerAuto)} data-testid="oauth-container-autodiscovery">
      <EuiTitle className={styles.title}><h4>Sign in to your Cloud Account</h4></EuiTitle>
      <EuiText className={styles.text} color="subdued">Auto-discover subscriptions and add your databases or create a free starter database</EuiText>
      <div className={styles.buttonsAuto}>
        {buttons}
      </div>
    </div>
  )
}

export default OAuthSocial
