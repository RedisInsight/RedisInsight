import React from 'react'
import { EuiButtonIcon } from '@elastic/eui'
import cx from 'classnames'
import { useDispatch, useSelector } from 'react-redux'

import { ipcAuthGithub, ipcAuthGoogle } from 'uiSrc/electron/utils'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import { oauthCloudSignInDialogSelector, signIn } from 'uiSrc/slices/oauth/cloud'

import { ReactComponent as GoogleIcon } from 'uiSrc/assets/img/oauth/google.svg'
import { ReactComponent as GithubIcon } from 'uiSrc/assets/img/oauth/github.svg'

import styles from './styles.module.scss'

const OAuthSocial = () => {
  const { source = '' } = useSelector(oauthCloudSignInDialogSelector)
  const dispatch = useDispatch()

  const sendTelemetry = (accountOption: string) => sendEventTelemetry({
    event: TelemetryEvent.CLOUD_SIGN_IN_SOCIAL_ACCOUNT_SELECTED,
    eventData: {
      source,
      accountOption,
    }
  })

  const socialLinks = [
    {
      className: styles.googleLink,
      icon: GoogleIcon,
      label: 'google-oauth',
      onClick: () => {
        sendTelemetry('Google')
        ipcAuthGoogle()
        dispatch(signIn())
      },
    },
    {
      icon: GithubIcon,
      label: 'github-oauth',
      className: styles.githubLink,
      onClick: () => {
        sendTelemetry('GitHub')
        ipcAuthGithub()
        dispatch(signIn())
      },
    }
  ]

  return (
    <div className={styles.container}>
      {socialLinks.map(({ icon, label, className = '', onClick }) => (
        <EuiButtonIcon
          key={label}
          iconType={icon}
          className={cx(styles.link, className)}
          onClick={onClick}
          data-testid={label}
          aria-labelledby={label}
        />
      ))}

    </div>
  )
}

export default OAuthSocial
