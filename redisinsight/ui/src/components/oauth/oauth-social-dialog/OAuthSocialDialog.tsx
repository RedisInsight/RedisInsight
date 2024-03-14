import React from 'react'
import { EuiModal, EuiModalBody } from '@elastic/eui'

import { useDispatch, useSelector } from 'react-redux'
import OAuthSocial from 'uiSrc/components/oauth/oauth-social/OAuthSocial'

import { oauthCloudSelector, setSocialDialogState } from 'uiSrc/slices/oauth/cloud'
import { OAuthSocialAction } from 'uiSrc/slices/interfaces'
import styles from './styles.module.scss'

const OAuthSocialDialog = () => {
  const { isOpenSocialDialog } = useSelector(oauthCloudSelector)

  const dispatch = useDispatch()

  const handleClose = () => {
    dispatch(setSocialDialogState(null))
  }

  if (!isOpenSocialDialog) {
    return null
  }

  return (
    <EuiModal onClose={handleClose} className={styles.modal} data-testid="social-oauth-dialog">
      <EuiModalBody>
        <OAuthSocial action={OAuthSocialAction.Import} />
      </EuiModalBody>
    </EuiModal>
  )
}

export default OAuthSocialDialog
