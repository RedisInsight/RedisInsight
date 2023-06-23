import React from 'react'
import cx from 'classnames'
import { EuiLoadingContent } from '@elastic/eui'

import styles from './styles.module.scss'

export interface Props {
  result: React.ReactElement | string;
  loading?: boolean;
}

const QueryCardCommonResult = (props: Props) => {
  const { result, loading } = props

  return (
    <div data-testid="query-common-result-wrapper" className={cx('queryResultsContainer', styles.container)}>
      {!loading && (
        <div data-testid="query-common-result">
          { result || '(nil)' }
        </div>
      )}
      {loading && (
        <div className={styles.loading}>
          <EuiLoadingContent lines={1} />
        </div>
      )}
    </div>
  )
}

export default QueryCardCommonResult
