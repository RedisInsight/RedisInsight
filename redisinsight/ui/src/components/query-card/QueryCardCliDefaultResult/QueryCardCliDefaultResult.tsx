import React from 'react'

import { CommandExecutionResult } from 'uiSrc/slices/interfaces'
import { cliParseTextResponse, CliPrefix, Maybe } from 'uiSrc/utils'

export interface Props {
  query: string
  result: Maybe<CommandExecutionResult[]>
}

export const resultTestId = 'query-cli-group-result'

const QueryCardCliGroupResult = (props: Props) => {
  const { result = [], query } = props

  return (
    <div data-testid={resultTestId}>
      {result?.map(({ response, status }) =>
        cliParseTextResponse(response || '(nil)', query, status, CliPrefix.QueryCard))}
    </div>
  )
}

export default QueryCardCliGroupResult
