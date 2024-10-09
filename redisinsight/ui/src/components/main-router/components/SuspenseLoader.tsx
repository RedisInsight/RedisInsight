import React from 'react'
import { EuiLoadingSpinner } from '@elastic/eui'
import styles from './loader.module.scss'

const SuspenseLoader = () => (
  <div className={styles.cover}>
    <EuiLoadingSpinner size="xl" className={styles.loader} />
  </div>
)

export default SuspenseLoader
