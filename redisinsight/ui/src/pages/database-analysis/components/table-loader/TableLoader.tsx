import React from 'react'

import { LoadingContent } from 'uiSrc/components/base/layout'
import styles from './styles.module.scss'

const TableLoader = () => (
  <div className={styles.container} data-testid="table-loader">
    <LoadingContent className={styles.title} lines={1} />
    <LoadingContent className={styles.table} lines={3} />
  </div>
)

export default TableLoader
