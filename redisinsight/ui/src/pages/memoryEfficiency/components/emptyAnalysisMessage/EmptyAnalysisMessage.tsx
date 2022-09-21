import React from 'react'
import { EuiText } from '@elastic/eui'

import styles from './styles.module.scss'

const EmptyAnalysisMessage = () => (
  <div className={styles.container} data-testid="empty-analysis">
    <div className={styles.content}>
      <EuiText className={styles.title}>No Reports found</EuiText>
      <EuiText className={styles.summary}>
        {`Run "New Analysis" to generate first report`}
      </EuiText>
    </div>
  </div>
)

export default EmptyAnalysisMessage
