import { EuiFlexGroup, EuiFlexItem, EuiIcon, EuiText } from '@elastic/eui'
import React from 'react'
import iwarning from 'uiSrc/assets/img/icons/warning.svg'
import styles from './styles.module.scss'

const UploadWarning = () => (
  <EuiFlexGroup className={styles.wrapper} gutterSize="xs" responsive={false}>
    <EuiFlexItem grow={false}>
      <EuiIcon type={iwarning} />
    </EuiFlexItem>
    <EuiFlexItem>
      <EuiText
        className={styles.warningMessage}
      >
        Use files only from trusted authors to avoid automatic execution of malicious code.
      </EuiText>
    </EuiFlexItem>
  </EuiFlexGroup>
)

export default UploadWarning
