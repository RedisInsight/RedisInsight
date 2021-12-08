import React from 'react'
import cx from 'classnames'
import { EuiLoadingContent } from '@elastic/eui'

import { cliParseTextResponse, CliPrefix, Maybe } from 'uiSrc/utils'
import { CommandExecutionStatus } from 'uiSrc/slices/interfaces/cli'

import styles from './styles.module.scss'

export interface Props {
  status: Maybe<CommandExecutionStatus>;
  query: string;
  result: any;
  loading?: boolean;
}

const QueryCardCliResult = (props: Props) => {
  const { result, query, status, loading } = props

  return (
    <div className={cx('queryResultsContainer', styles.container)}>
      {!loading && (
        <div data-testid="query-cli-result">
          {cliParseTextResponse(result || '(nil)', query, status, CliPrefix.QueryCard)}
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

export default QueryCardCliResult
