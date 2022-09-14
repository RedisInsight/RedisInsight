import React from 'react'
import cx from 'classnames'
import { EuiLoadingContent, EuiIcon, EuiText } from '@elastic/eui'
import { isArray } from 'lodash'

import { CommandExecutionResult } from 'uiSrc/slices/interfaces'
import { ResultsMode } from 'uiSrc/slices/interfaces/workbench'
import { Maybe } from 'uiSrc/utils'

import QueryCardCliDefaultResult from '../QueryCardCliDefaultResult'
import QueryCardCliGroupResult from '../QueryCardCliGroupResult'
import styles from './styles.module.scss'

export interface Props {
  query: string
  result: Maybe<CommandExecutionResult[]>
  loading?: boolean
  status?: string
  resultsMode?: ResultsMode
  isNotStored?: boolean
}

const QueryCardCliResultWrapper = (props: Props) => {
  const { result = [], query, loading, resultsMode, isNotStored } = props

  return (
    <div className={cx('queryResultsContainer', styles.container)}>
      {!loading && (
        <div data-testid="query-cli-result">
          {isNotStored && (
            <EuiText className={styles.alert} data-testid="query-cli-warning">
              <EuiIcon type="alert" className={styles.alertIcon} />
              The result is too big to be saved. It will be deleted after the application is closed.
            </EuiText>
          )}
          {resultsMode === ResultsMode.GroupMode && isArray(result[0]?.response)
            ? <QueryCardCliGroupResult result={result} />
            : <QueryCardCliDefaultResult query={query} result={result} />}
        </div>
      )}
      {loading && (
        <div className={styles.loading} data-testid="query-cli-loader">
          <EuiLoadingContent lines={1} />
        </div>
      )}
    </div>
  )
}

export default QueryCardCliResultWrapper
