import React from 'react'
import cx from 'classnames'
import { EuiLoadingContent, EuiIcon, EuiText } from '@elastic/eui'
import { isArray } from 'lodash'

import { CommandExecutionResult } from 'uiSrc/slices/interfaces'
import { ResultsMode } from 'uiSrc/slices/interfaces/workbench'
import { cliParseTextResponse, formatToText, replaceEmptyValue, isGroupResults, Maybe } from 'uiSrc/utils'

import { CommandExecutionStatus } from 'uiSrc/slices/interfaces/cli'
import QueryCardCliDefaultResult from '../QueryCardCliDefaultResult'
import QueryCardCliGroupResult from '../QueryCardCliGroupResult'
import styles from './styles.module.scss'

export interface Props {
  query: string
  result: Maybe<CommandExecutionResult[]>
  loading?: boolean
  resultsMode?: ResultsMode
  isNotStored?: boolean
  isFullScreen?: boolean
  db?: number
}

const QueryCardCliResultWrapper = (props: Props) => {
  const { result = [], query, loading, resultsMode, isNotStored, isFullScreen, db } = props

  return (
    <div data-testid="query-cli-result-wrapper" className={cx('queryResultsContainer', styles.container)}>
      {!loading && (
        <div data-testid="query-cli-result" className={cx(styles.content)}>
          {isNotStored && (
            <EuiText className={styles.alert} data-testid="query-cli-warning">
              <EuiIcon type="alert" className={styles.alertIcon} />
              The result is too big to be saved. It will be deleted after the application is closed.
            </EuiText>
          )}
          {isGroupResults(resultsMode) && isArray(result[0]?.response)
            ? <QueryCardCliGroupResult result={result} isFullScreen={isFullScreen} db={db} />
            : (
              <QueryCardCliDefaultResult
                isFullScreen={isFullScreen}
                items={
                  result[0]?.status === CommandExecutionStatus.Success
                    ? formatToText(replaceEmptyValue(result[0]?.response), query).split('\n')
                    : [cliParseTextResponse(replaceEmptyValue(result[0]?.response), '', result[0]?.status)]
                }
              />
            )}
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

export default React.memo(QueryCardCliResultWrapper)
