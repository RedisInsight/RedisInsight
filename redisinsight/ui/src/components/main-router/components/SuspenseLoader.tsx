import React from 'react'
import { EuiLoadingSpinner } from '@elastic/eui'
import styles from './loader.module.scss'

const SuspenseLoader = () => (
  <div className={styles.cover} data-testid="suspense-loader">
    <EuiLoadingSpinner size="xl" className={styles.loader} />
  </div>
)

export default SuspenseLoader
