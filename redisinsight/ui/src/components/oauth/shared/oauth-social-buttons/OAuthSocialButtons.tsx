import React from 'react'
import { EuiIcon, EuiText, EuiToolTip } from '@elastic/eui'
import cx from 'classnames'
import { useSelector } from 'react-redux'
import { oauthCloudPAgreementSelector } from 'uiSrc/slices/oauth/cloud'
import { OAuthStrategy } from 'uiSrc/slices/interfaces'

import GoogleIcon from 'uiSrc/assets/img/oauth/google.svg?react'
import GithubIcon from 'uiSrc/assets/img/oauth/github.svg?react'
import SsoIcon from 'uiSrc/assets/img/oauth/sso.svg?react'

import { EmptyButton } from 'uiSrc/components/base/forms/buttons'
import { FlexItem } from 'uiSrc/components/base/layout/flex'
import styles from './styles.module.scss'

export interface Props {
  onClick: (authStrategy: OAuthStrategy) => void
  className?: string
  inline?: boolean
  disabled?: boolean
}

const OAuthSocialButtons = (props: Props) => {
  const { onClick, className, inline, disabled } = props

  const agreement = useSelector(oauthCloudPAgreementSelector)

  const socialLinks = [
    {
      text: 'Google',
      className: styles.googleButton,
      icon: GoogleIcon,
      label: 'google-oauth',
      strategy: OAuthStrategy.Google,
    },
    {
      text: 'Github',
      className: styles.githubButton,
      icon: GithubIcon,
      label: 'github-oauth',
      strategy: OAuthStrategy.GitHub,
    },
    {
      text: 'SSO',
      className: styles.ssoButton,
      icon: SsoIcon,
      label: 'sso-oauth',
      strategy: OAuthStrategy.SSO,
    },
  ]

  return (
    <div
      className={cx(styles.container, className)}
      data-testid="oauth-container-social-buttons"
    >
      {socialLinks.map(({ strategy, text, icon, label, className = '' }) => (
        <EuiToolTip
          key={label}
          position="top"
          anchorClassName={!agreement ? 'euiToolTip__btn-disabled' : ''}
          content={agreement ? null : 'Acknowledge the agreement'}
          data-testid={`${label}-tooltip`}
        >
          <EmptyButton
            disabled={!agreement || disabled}
            className={cx(styles.button, className, {
              [styles.inline]: inline,
            })}
            onClick={() => {
              onClick(strategy)
            }}
            data-testid={label}
            aria-labelledby={label}
          >
            <FlexItem direction={inline ? 'row' : 'column'}>
              <EuiIcon type={icon} />
              <EuiText className={styles.label}>{text}</EuiText>
            </FlexItem>
          </EmptyButton>
        </EuiToolTip>
      ))}
    </div>
  )
}

export default OAuthSocialButtons
