import React from 'react'
import { EuiModal, EuiModalBody } from '@elastic/eui'

import { useDispatch, useSelector } from 'react-redux'

import cx from 'classnames'
import { oauthCloudSelector, setSocialDialogState } from 'uiSrc/slices/oauth/cloud'
import { OAuthSocialAction } from 'uiSrc/slices/interfaces'
import { cloudSelector } from 'uiSrc/slices/instances/cloud'
import { OAuthCreateDb, OAuthSignIn } from 'uiSrc/components/oauth/oauth-sso'

import styles from './styles.module.scss'

const OAuthSsoDialog = () => {
  const { ssoFlow } = useSelector(cloudSelector)
  const { isOpenSocialDialog, source } = useSelector(oauthCloudSelector)

  const dispatch = useDispatch()

  const handleClose = () => {
    dispatch(setSocialDialogState(null))
  }

  if (!isOpenSocialDialog || !ssoFlow) {
    return null
  }

  return (
    <EuiModal
      onClose={handleClose}
      className={cx(styles.modal, {
        [styles.createDb]: ssoFlow === OAuthSocialAction.Create,
        [styles.signIn]: ssoFlow === OAuthSocialAction.SignIn,
        [styles.import]: ssoFlow === OAuthSocialAction.Import,
      })}
      data-testid="social-oauth-dialog"
    >
      <EuiModalBody>
        {ssoFlow === OAuthSocialAction.Create && (<OAuthCreateDb source={source} />)}
        {ssoFlow === OAuthSocialAction.SignIn && (<OAuthSignIn source={source} />)}
        {ssoFlow === OAuthSocialAction.Import && (<OAuthSignIn action={OAuthSocialAction.Import} source={source} />)}
      </EuiModalBody>
    </EuiModal>
  )
}

export default OAuthSsoDialog
