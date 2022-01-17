/* eslint-disable react/jsx-filename-extension */
import React from 'react'
import { appendIconComponentCache } from '@elastic/eui/es/components/icon/icon'
import { TableResult } from './components'

import {
  cachedIcons,
  parseResponse,
} from './utils'

interface Props {
  command: string
  result?: { response: any, status: string }[]
}

// This is problematic for some bundlers and/or deployments,
// so a method exists to preload specific icons an application needs.
appendIconComponentCache(cachedIcons)

const App = (props: Props) => {
  const { command = '', result: [{ response = '', status = '' } = {}] = [] } = props

  const result = parseResponse(response)

  if (status === 'fail') {
    return <div className="responseFail">{response}</div>
  }

  return <TableResult query={command} result={result} />
}

export default App
