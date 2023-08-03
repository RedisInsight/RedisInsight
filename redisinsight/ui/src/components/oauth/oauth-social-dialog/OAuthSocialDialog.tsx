import React from 'react'
import { EuiModal, EuiModalBody } from '@elastic/eui'

import OAuthSocial, { OAuthSocialType } from 'uiSrc/components/oauth/oauth-social/OAuthSocial'

import styles from './styles.module.scss'

export interface Props {
  onClose: () => void
}

const OAuthSocialDialog = ({ onClose }: Props) => (
  <EuiModal onClose={() => onClose?.()} className={styles.modal} data-testid="social-oauth-dialog">
    <EuiModalBody>
      <OAuthSocial type={OAuthSocialType.Autodiscovery} />
    </EuiModalBody>
  </EuiModal>
)

export default OAuthSocialDialog
