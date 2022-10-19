import React from 'react'
import { EuiLoadingContent } from '@elastic/eui'

import styles from './styles.module.scss'

const TableLoader = () => (
  <div className={styles.container} data-testid="table-loader">
    <EuiLoadingContent className={styles.title} lines={1} />
    <EuiLoadingContent className={styles.table} lines={3} />
  </div>
)

export default TableLoader
