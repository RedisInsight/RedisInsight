import React from 'react'

import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import styles from './styles.module.scss'

const UploadWarning = () => (
  <Row className={styles.wrapper} gap="s" align="center">
    <FlexItem>
      <RiIcon type="IndicatorErrorIcon" />
    </FlexItem>
    <FlexItem>
      <Text className={styles.warningMessage}>
        Use files only from trusted authors to avoid automatic execution of
        malicious code.
      </Text>
    </FlexItem>
  </Row>
)

export default UploadWarning
