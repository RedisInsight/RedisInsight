import React from 'react'
import { EuiButtonEmpty, EuiIcon, EuiText, EuiToolTip } from '@elastic/eui'
import cx from 'classnames'
import { useDispatch, useSelector } from 'react-redux'
import { ipcAuthGithub, ipcAuthGoogle } from 'uiSrc/electron/utils'
import { oauthCloudPAgreementSelector, signIn } from 'uiSrc/slices/oauth/cloud'
import { OAuthSocialAction } from 'uiSrc/slices/interfaces'

import { ReactComponent as GoogleIcon } from 'uiSrc/assets/img/oauth/google.svg'
import { ReactComponent as GithubIcon } from 'uiSrc/assets/img/oauth/github.svg'

import styles from './styles.module.scss'

export interface Props {
  onClick?: (buttonType: string) => void
  action: OAuthSocialAction
  className?: string
  inline?: boolean
}

const OAuthSocialButtons = (props: Props) => {
  const { onClick, action, className, inline } = props

  const agreement = useSelector(oauthCloudPAgreementSelector)

  const dispatch = useDispatch()

  const handleClickSso = () => {
    dispatch(signIn())
  }

  const socialLinks = [
    {
      text: 'Google',
      className: styles.googleButton,
      icon: GoogleIcon,
      label: 'google-oauth',
      onButtonClick: () => {
        onClick?.('Google')
        ipcAuthGoogle(action)
      },
    },
    {
      text: 'Github',
      icon: GithubIcon,
      label: 'github-oauth',
      className: styles.githubButton,
      onButtonClick: () => {
        onClick?.('GitHub')
        ipcAuthGithub(action)
      },
    }
  ]

  return (
    <div className={cx(styles.container, className)} data-testid="oauth-container-social-buttons">
      {socialLinks.map(({ text, icon, label, className = '', onButtonClick }) => (
        <EuiToolTip
          key={label}
          position="top"
          anchorClassName={!agreement ? 'euiToolTip__btn-disabled' : ''}
          content={agreement ? null : 'Acknowledge the agreement'}
          data-testid={`${label}-tooltip`}
        >
          <>
            <EuiButtonEmpty
              disabled={!agreement}
              className={cx(styles.button, className, { [styles.inline]: inline })}
              onClick={() => {
                handleClickSso()
                onButtonClick()
              }}
              data-testid={label}
              aria-labelledby={label}
            >
              <EuiIcon type={icon} />
              <EuiText className={styles.label}>{text}</EuiText>
            </EuiButtonEmpty>
          </>
        </EuiToolTip>
      ))}
    </div>
  )
}

export default OAuthSocialButtons
