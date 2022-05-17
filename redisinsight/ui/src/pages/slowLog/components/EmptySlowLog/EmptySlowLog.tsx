import { EuiText, EuiTitle } from '@elastic/eui'
import React from 'react'

import styles from '../styles.module.scss'

const EmptySlowLog = () => (
  <div className={styles.noSlowLogWrapper} data-testid="empty-slow-log">
    <div className={styles.noSlowLogText}>
      <EuiTitle className={styles.noFoundTitle}>
        <h4>No Slow Logs found</h4>
      </EuiTitle>
      <EuiText color="subdued">
        Either no commands exceeding 10000 µs were found or Slow Log is disabled on the server.
      </EuiText>
    </div>
  </div>
)

export default EmptySlowLog
