import React from 'react'

import { CommandExecutionResult } from 'uiSrc/slices/interfaces'
import { cliParseCommandsGroupResult, Maybe } from 'uiSrc/utils'

const QueryCardCliGroupResult = ({ result = [] } : { result: Maybe<CommandExecutionResult[] > }) => (
  <div data-testid="query-cli-default-result">
    {result[0].response.map((item: any, index: number) =>
      cliParseCommandsGroupResult(item, index))}
  </div>
)

export default QueryCardCliGroupResult
