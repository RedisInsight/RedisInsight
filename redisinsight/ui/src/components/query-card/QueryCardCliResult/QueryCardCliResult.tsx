import React from 'react'
import cx from 'classnames'
import { EuiLoadingContent } from '@elastic/eui'

import { CommandExecutionResult } from 'uiSrc/slices/interfaces'
import { cliParseTextResponse, CliPrefix, Maybe, } from 'uiSrc/utils'

import styles from './styles.module.scss'

export interface Props {
  query: string;
  result: Maybe<CommandExecutionResult[]>
  loading?: boolean;
}

const QueryCardCliResult = (props: Props) => {
  const { result = [], query, loading } = props

  return (
    <div className={cx('queryResultsContainer', styles.container)}>
      {!loading && (
        <div data-testid="query-cli-result">
          {result?.map(({ response, status }) =>
            cliParseTextResponse(response || '(nil)', query, status, CliPrefix.QueryCard))}
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

export default React.memo(QueryCardCliResult)
