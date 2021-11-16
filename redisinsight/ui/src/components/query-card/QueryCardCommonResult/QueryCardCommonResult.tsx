import React from 'react'
import cx from 'classnames'
import { EuiLoadingContent } from '@elastic/eui'

import styles from './styles.module.scss'

export interface Props {
  result: React.ReactElement;
}

const QueryCardCommonResult = (props: Props) => {
  const { result } = props

  return (
    <div className={cx('queryResultsContainer', styles.container)}>
      {!!result && (
        <div data-testid="query-common-result">
          { result }
        </div>
      )}
      {!result && (
        <div className={styles.loading}>
          <EuiLoadingContent lines={1} />
        </div>
      )}
    </div>
  )
}

export default QueryCardCommonResult
