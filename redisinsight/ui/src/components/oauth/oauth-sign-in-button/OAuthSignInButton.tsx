import React from 'react'
import { EuiButton, EuiImage } from '@elastic/eui'

import { OAuthSsoHandlerDialog } from 'uiSrc/components'

import RedisLogo from 'uiSrc/assets/img/logo_small.svg'

import { OAuthSocialAction, OAuthSocialSource } from 'uiSrc/slices/interfaces'
import styles from './styles.module.scss'

export interface Props {
  source: OAuthSocialSource
}

const OAuthSignInButton = (props: Props) => {
  const { source } = props

  return (
    <OAuthSsoHandlerDialog>
      {(socialCloudHandlerClick) => (
        <EuiButton
          className={styles.btn}
          size="s"
          onClick={(e: React.MouseEvent) => socialCloudHandlerClick(
            e,
            {
              source,
              action: OAuthSocialAction.SignIn
            }
          )}
          data-testid="cloud-sign-in-btn"
        >
          <EuiImage className={styles.logo} src={RedisLogo} alt="" />
          <span>Cloud sign in</span>
        </EuiButton>
      )}
    </OAuthSsoHandlerDialog>
  )
}

export default OAuthSignInButton
