import React from 'react'
import cx from 'classnames'
import { EuiLoadingContent } from '@elastic/eui'

import { cliParseTextResponse, CliPrefix, Maybe } from 'uiSrc/utils'
import { CommandExecutionStatus } from 'uiSrc/slices/interfaces/cli'
import styles from './styles.module.scss'

export interface Props {
  status: Maybe<CommandExecutionStatus>;
  result: any;
}

const QueryCardCliResult = (props: Props) => {
  const { result, status } = props

  return (
    <div className={cx('queryResultsContainer', styles.container)}>
      {!!result && (
        <div data-testid="query-cli-result">
          {cliParseTextResponse(result, status, CliPrefix.QueryCard)}
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

export default QueryCardCliResult
