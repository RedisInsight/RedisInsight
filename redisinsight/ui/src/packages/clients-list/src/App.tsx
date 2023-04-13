/* eslint-disable react/jsx-filename-extension */
import React from 'react'
import { appendIconComponentCache } from '@elastic/eui/es/components/icon/icon'
import { JSONView, TableView } from './components'

import {
  cachedIcons,
  parseClientListResponse,
  parseJSONASCIIResponse,
} from './utils'

export enum CommonPlugin {
  ClientList = 'ClientList',
  JSON = 'JSON',
}

export enum RawMode {
  Raw = 'Raw',
  ASCII = 'ASCII',
}

interface Props {
  plugin: CommonPlugin
  command: string
  mode: RawMode
  result?: { response: any, status: string }[]
}

// This is problematic for some bundlers and/or deployments,
// so a method exists to preload specific icons an application needs.
appendIconComponentCache(cachedIcons)

const getJsonResultString = (result:any, mode: RawMode) =>
  (mode !== RawMode.Raw ? parseJSONASCIIResponse(result) : result)

const getJsonResultStringFromArr = (response: any, mode: RawMode) =>
  `[${response.map((result: any) => getJsonResultString(result, mode)).join(',')}]`

const App = (props: Props) => {
  const { command = '', result: [{ response = '', status = '' } = {}] = [], plugin, mode } = props

  if (status === 'fail') {
    return (
      <div className="cli-container">
        <div className="cli-output-response-fail">{JSON.stringify(response)}</div>
      </div>
    )
  }

  switch (plugin) {
    case CommonPlugin.ClientList:
      const clientResult = parseClientListResponse(response)
      return <TableView query={command} result={clientResult} />

    case CommonPlugin.JSON:
    default:
      const jsonResultString = Array.isArray(response)
        ? getJsonResultStringFromArr(response, mode)
        : getJsonResultString(response, mode)

      return (
        <div className="cli-container">
          <JSONView value={jsonResultString} command={command} />
        </div>
      )
  }
}

export default App
