import { flatten } from 'lodash'
import React from 'react'

import { CommandExecutionResult } from 'uiSrc/slices/interfaces'
import { cliParseCommandsGroupResult, Maybe } from 'uiSrc/utils'
import QueryCardCliDefaultResult from '../QueryCardCliDefaultResult'

export interface Props {
  result?: Maybe<CommandExecutionResult[]>
  isFullScreen?: boolean
}

const QueryCardCliGroupResult = (props: Props) => {
  const { result = [], isFullScreen } = props
  return (
    <div data-testid="query-cli-default-result" className="query-card-output-response-success">
      <QueryCardCliDefaultResult
        isFullScreen={isFullScreen}
        items={flatten(result?.[0]?.response.map((item: any) =>
          flatten(cliParseCommandsGroupResult(item))))}
      />
    </div>
  )
}

export default QueryCardCliGroupResult
