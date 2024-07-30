import { EuiBasicTableColumn, EuiIcon, EuiToolTip } from '@elastic/eui'
import React from 'react'

import { IConnections } from 'uiSrc/slices/interfaces'
import { formatLongName } from 'uiSrc/utils'
import Accordion from '../components/accordion'
import Panel from '../components/panel'
import Table from '../components/table'

type ConnectionData = {
  status: string
  name: string
  type: string
  hostPort: string
  database: string
  user: string
}

const columns: EuiBasicTableColumn<ConnectionData>[] = [
  {
    name: 'Status',
    field: 'status',
    width: '80px',
    render: (status: string) =>
      (status === 'good' ? (
        <EuiIcon type="dot" color="var(--buttonSuccessColor)" />
      ) : (
        <EuiIcon type="alert" color="danger" />
      )),
    align: 'center',
    sortable: true
  },
  {
    name: 'Name',
    field: 'name',
    width: '15%',
    sortable: true
  },
  {
    name: 'Type',
    field: 'type',
    width: '10%',
    sortable: true
  },
  {
    name: 'Host:port',
    field: 'hostPort',
    sortable: true,
    render: (hostPort: string) => (
      <EuiToolTip content={hostPort}>
        <span>{formatLongName(hostPort, 80, 0, '...')}</span>
      </EuiToolTip>
    )
  },
  {
    name: 'Database',
    field: 'database',
    width: '15%',
    sortable: true
  },
  {
    name: 'Username',
    field: 'user',
    width: '15%',
    sortable: true
  }
]

interface Props {
  data: IConnections
}

const TargetConnections = ({ data }: Props) => {
  const connections = Object.keys(data).map((key) => {
    const connection = data[key]
    return {
      name: key,
      hostPort: `${connection.host}:${connection.port}`,
      ...connection
    }
  })

  return (
    <Panel>
      <Accordion id="target-connections" title="Target connections" hideAutoRefresh>
        <Table<ConnectionData> id="target-connections" columns={columns} items={connections} initialSortField="name" />
      </Accordion>
    </Panel>
  )
}

export default TargetConnections
