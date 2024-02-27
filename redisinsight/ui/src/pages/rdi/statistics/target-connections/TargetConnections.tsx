import { EuiBasicTableColumn, EuiIcon, EuiToolTip } from '@elastic/eui'
import React from 'react'

import { formatLongName } from 'uiSrc/utils'
import Accordion from '../components/accordion'
import Panel from '../components/panel'
import Table from '../components/table'

type Connection = {
  status: string
  name: string
  type: string
  hostPort: string
  database: string
  user: string
}

const columns: EuiBasicTableColumn<Connection>[] = [
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

const connectionsData = {
  Connection1: {
    status: 'good',
    type: 'type1',
    host: 'Redis-Stack-in-Redis-Enterprise-Cloud',
    port: 12000,
    database: 'admin',
    user: 'admin'
  },
  Connection2: {
    status: 'bad',
    type: 'type2',
    host: 'redis-15797.c52.us-east-1-4.ec2.redis-15797.c52.us-east-1-4.e.us-east-1vnvnvnb-4.ec2.cloud.redislabs.com',
    port: 13000,
    database: 'admin_new',
    user: 'admin_new'
  },
  Connection3: {
    status: 'good',
    type: 'type3',
    host: 'redis-15797.c52.us-east-1-4',
    port: 14000,
    database: 'new',
    user: 'new'
  }
}

const TargetConnections = () => {
  const targetConnections = Object.keys(connectionsData).map((key) => {
    const connection = connectionsData[key]
    return {
      name: key,
      hostPort: `${connection.host}:${connection.port}`,
      status: connection.status,
      type: connection.type,
      database: connection.database,
      user: connection.user
    }
  })

  return (
    <Panel>
      <Accordion id="target-connections" title="Target connections">
        <Table<Connection>
          id="target-connections"
          columns={columns}
          items={targetConnections}
          initialSortField="name"
        />
      </Accordion>
    </Panel>
  )
}

export default TargetConnections
