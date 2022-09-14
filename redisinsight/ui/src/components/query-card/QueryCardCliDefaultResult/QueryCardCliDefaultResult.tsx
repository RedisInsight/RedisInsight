import React from 'react'

import { CommandExecutionResult } from 'uiSrc/slices/interfaces'
import { cliParseTextResponse, CliPrefix, Maybe } from 'uiSrc/utils'

export interface Props {
  query: string
  result: Maybe<CommandExecutionResult[]>
}

const QueryCardCliGroupResult = (props: Props) => {
  const { result = [], query } = props

  return (
    <div data-testid="query-cli-group-result">
      {result?.map(({ response, status }) =>
        cliParseTextResponse(response || '(nil)', query, status, CliPrefix.QueryCard))}
    </div>
  )
}

export default QueryCardCliGroupResult
