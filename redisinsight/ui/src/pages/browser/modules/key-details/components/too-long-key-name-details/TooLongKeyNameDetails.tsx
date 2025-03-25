import React from 'react'
import { EuiFlexGroup, EuiFlexItem, EuiText, EuiTitle } from '@elastic/eui'

import styles from './styles.module.scss'

const TooLongKeyNameDetails = () => (
  <div className={styles.container} data-testid="too-long-key-name-details">
    <EuiFlexGroup alignItems="center" justifyContent="center">
      <EuiFlexItem className={styles.textWrapper}>
        <EuiTitle>
          <h4>The key name is too long</h4>
        </EuiTitle>
        <EuiText size="s">
          Details cannot be displayed.
        </EuiText>
      </EuiFlexItem>
    </EuiFlexGroup>
  </div>
)

export default TooLongKeyNameDetails
