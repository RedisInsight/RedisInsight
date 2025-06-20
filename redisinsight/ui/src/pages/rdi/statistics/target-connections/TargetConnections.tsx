import { EuiIcon, EuiToolTip } from '@elastic/eui'
import React from 'react'

import {
  IConnections,
  StatisticsConnectionStatus,
} from 'uiSrc/slices/interfaces'
import { formatLongName } from 'uiSrc/utils'
import { Table, ColumnDefinition } from 'uiSrc/components/base/layout/table'
import Accordion from '../components/accordion'
import Panel from '../components/panel'

type ConnectionData = {
  name: string
  status: string
  type: string
  hostPort: string
  database: string
  user: string
}

const columns: ColumnDefinition<ConnectionData>[] = [
  {
    header: 'Status',
    id: 'status',
    accessorKey: 'status',
    enableSorting: true,
    cell: ({
      row: {
        original: { status },
      },
    }) =>
      status === StatisticsConnectionStatus.connected ? (
        <EuiIcon type="dot" color="var(--buttonSuccessColor)" />
      ) : (
        <EuiIcon type="alert" color="danger" />
      ),
  },
  {
    header: 'Name',
    id: 'name',
    accessorKey: 'name',
    enableSorting: true,
  },
  {
    header: 'Type',
    id: 'type',
    accessorKey: 'type',
    enableSorting: true,
  },
  {
    header: 'Host:port',
    id: 'hostPort',
    accessorKey: 'hostPort',
    enableSorting: true,
    cell: ({
      row: {
        original: { hostPort },
      },
    }) => (
      <EuiToolTip content={hostPort}>
        <span>{formatLongName(hostPort, 80, 0, '...')}</span>
      </EuiToolTip>
    ),
  },
  {
    header: 'Database',
    id: 'database',
    accessorKey: 'database',
    enableSorting: true,
  },
  {
    header: 'Username',
    id: 'user',
    accessorKey: 'user',
    enableSorting: true,
  },
]

interface Props {
  data: IConnections
}

const TargetConnections = ({ data }: Props) => {
  const connections: ConnectionData[] = Object.keys(data).map((key) => {
    const connection = data[key]
    return {
      name: key,
      hostPort: `${connection.host}:${connection.port}`,
      ...connection,
    }
  })

  return (
    <Panel>
      <Accordion
        id="target-connections"
        title="Target connections"
        hideAutoRefresh
      >
        <Table
          columns={columns}
          data={connections}
          defaultSorting={[{ id: 'name', desc: false }]}
        />
      </Accordion>
    </Panel>
  )
}

export default TargetConnections
