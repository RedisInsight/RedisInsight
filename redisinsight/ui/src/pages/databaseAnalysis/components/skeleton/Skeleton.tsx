import React from 'react'
import { EuiLoadingContent, EuiTitle } from '@elastic/eui'

import styles from '../../styles.module.scss'

const Skeleton = () => (
  <div className={styles.grid}>
    <div>
      <EuiTitle className={styles.sectionTitle}>
        <h4>TOP NAMESPACES</h4>
      </EuiTitle>
      <div style={{ height: '380px' }} data-testid="nsp-table-loading">
        <EuiLoadingContent lines={4} />
      </div>
    </div>
  </div>
)

export default Skeleton
