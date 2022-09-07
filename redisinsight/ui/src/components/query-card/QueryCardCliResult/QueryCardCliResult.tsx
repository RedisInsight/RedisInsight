import React from 'react'
import cx from 'classnames'
import { EuiLoadingContent } from '@elastic/eui'

import { CommandExecutionResult } from 'uiSrc/slices/interfaces'
import { cliParseTextResponse, cliParseCommandsGroupResult, CliPrefix, Maybe } from 'uiSrc/utils'

import styles from './styles.module.scss'

export interface Props {
  query: string
  result: Maybe<CommandExecutionResult[]>
  loading?: boolean
  status?: string
  summary?: string
}

const QueryCardCliResult = (props: Props) => {
  const { result = [], query, loading, summary } = props

  return (
    <div className={cx('queryResultsContainer', styles.container)}>
      {!loading && (
        <div data-testid="query-cli-result">
          {!summary ? result?.map(({ response, status }) =>
            cliParseTextResponse(response || '(nil)', query, status, CliPrefix.QueryCard))
            : result[0].response.map((item: CommandExecutionResult, index: number) =>
              cliParseCommandsGroupResult(item, query, index))}
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
