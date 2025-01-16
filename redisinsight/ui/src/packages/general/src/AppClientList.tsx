import React from 'react'

import { TableView } from './modules/ClientList/components'
import { ResponseProps } from './interfaces'
import { parseClientListResponse } from './utils'

const AppClientList = (props: ResponseProps) => {
  const { command = '', data: [{ response = '' } = {}] = [] } = props

  const clientResult = parseClientListResponse(response)
  return <TableView query={command} result={clientResult} />
}

export default AppClientList
