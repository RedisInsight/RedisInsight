import React from 'react'

import { JSONView } from './modules/ClientList/components'
import { parseJSONASCIIResponse } from './utils'
import { ResponseProps } from './interfaces'
import { RawMode } from './constants'

const getJsonResultString = (result:any, mode: RawMode) =>
  (mode !== RawMode.RAW && result !== null
    ? parseJSONASCIIResponse(result)
    : result)

const getJsonResultStringFromArr = (response: any, mode: RawMode) =>
  `[${response.map((result: any) => getJsonResultString(result, mode)).join(',')}]`

const AppReJSON = (props: ResponseProps) => {
  const { command = '', data: [{ response = '' } = {}] = [], mode } = props

  const jsonResultString = Array.isArray(response)
    ? getJsonResultStringFromArr(response, mode)
    : getJsonResultString(response, mode)

  return (
    <div className="cli-container">
      <JSONView value={jsonResultString} command={command} />
    </div>
  )
}

export default AppReJSON
