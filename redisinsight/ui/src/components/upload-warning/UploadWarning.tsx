import { EuiIcon, EuiText } from '@elastic/eui'
import React from 'react'
import iwarning from 'uiSrc/assets/img/icons/warning.svg'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import styles from './styles.module.scss'

const UploadWarning = () => (
  <Row className={styles.wrapper} gap="s">
    <FlexItem>
      <EuiIcon type={iwarning} />
    </FlexItem>
    <FlexItem>
      <EuiText className={styles.warningMessage}>
        Use files only from trusted authors to avoid automatic execution of
        malicious code.
      </EuiText>
    </FlexItem>
  </Row>
)

export default UploadWarning
