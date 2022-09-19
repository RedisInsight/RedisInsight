import React from 'react'

import { CommandExecutionResult } from 'uiSrc/slices/interfaces'
import { cliParseCommandsGroupResult, Maybe } from 'uiSrc/utils'

export interface Props {
  result?: Maybe<CommandExecutionResult[]>
}

const QueryCardCliGroupResult = (props: Props) => {
  const { result = [] } = props
  return (
    <div data-testid="query-cli-default-result" className="query-card-output-response-success">
      {result[0]?.response.map((item: any, index: number) =>
        cliParseCommandsGroupResult(item, index))}
    </div>
  )
}

export default QueryCardCliGroupResult
