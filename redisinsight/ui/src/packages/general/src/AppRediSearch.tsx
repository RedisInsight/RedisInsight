/* eslint-disable react/jsx-filename-extension */
import React from 'react'
import { isArray } from 'lodash'
import { setHeaderText } from 'redisinsight-plugin-sdk'

import {
  parseInfoRawResponse,
  parseSearchRawResponse,
  parseAggregateRawResponse
} from './utils'
import { Command, ProfileType } from './constants'
import { TableInfoResult, TableResult } from './components'
import { ResponseProps } from './interfaces'

const AppRediSearch = (props: ResponseProps) => {
  const { command = '', data: [{ response = '' } = {}] = [] } = props

  const commandUpper = command.toUpperCase()

  if (commandUpper.startsWith(Command.Info)) {
    const result = parseInfoRawResponse(response)
    return <TableInfoResult query={command} result={result} />
  }

  const isProfileCommand = commandUpper.startsWith(Command.Profile)
  const profileQueryType = command?.split(' ')?.[2]

  if (
    commandUpper.startsWith(Command.Aggregate)
    || (isProfileCommand && profileQueryType.toUpperCase() === ProfileType.Aggregate)
  ) {
    const isResponseInArray = isArray(response[0])
    const [matched, ...arrayResponse] = isResponseInArray ? response[0] : response
    setHeaderText(`Matched:${matched}`)

    const result = parseAggregateRawResponse(arrayResponse)
    return (
      <TableResult
        query={command}
        result={result}
        matched={matched}
        cursorId={isResponseInArray ? response[1] : null}
      />
    )
  }

  if (
    commandUpper.startsWith(Command.Search)
    || (isProfileCommand && profileQueryType.toUpperCase() === ProfileType.Search)
  ) {
    const [matched, ...arrayResponse] = isProfileCommand ? response[0] : response
    setHeaderText(`Matched:${matched}`)

    const result = parseSearchRawResponse(command, arrayResponse)
    return <TableResult query={command} result={result} matched={matched} />
  }

  return null
}

export default AppRediSearch
