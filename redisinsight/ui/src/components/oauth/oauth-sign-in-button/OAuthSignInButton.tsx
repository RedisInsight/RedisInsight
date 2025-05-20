import React from 'react'
import { EuiImage } from '@elastic/eui'

import { OAuthSsoHandlerDialog } from 'uiSrc/components'

import RedisLogo from 'uiSrc/assets/img/logo_small.svg'

import { OAuthSocialAction, OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { SecondaryButton } from 'uiSrc/components/base/forms/buttons'
import styles from './styles.module.scss'

export interface Props {
  source: OAuthSocialSource
}

const OAuthSignInButton = (props: Props) => {
  const { source } = props

  return (
    <OAuthSsoHandlerDialog>
      {(socialCloudHandlerClick) => (
        <SecondaryButton
          className={styles.btn}
          size="s"
          onClick={(e: React.MouseEvent) =>
            socialCloudHandlerClick(e, {
              source,
              action: OAuthSocialAction.SignIn,
            })
          }
          data-testid="cloud-sign-in-btn"
        >
          <EuiImage className={styles.logo} src={RedisLogo} alt="" />
          <span>Cloud sign in</span>
        </SecondaryButton>
      )}
    </OAuthSsoHandlerDialog>
  )
}

export default OAuthSignInButton
