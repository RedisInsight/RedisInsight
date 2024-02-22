import React from 'react'

import { EuiBasicTableColumn } from '@elastic/eui'
import Accordion from '../components/accordion'
import Panel from '../components/panel'
import Table from '../components/table'

type Client = {
  id: string
  addr: string
  name: string
  ageSec: number
  idleSec: number
  user: string
}

const columns: EuiBasicTableColumn<Client>[] = [
  {
    name: 'ID',
    field: 'id',
    sortable: true
  },
  {
    name: 'ADDR',
    field: 'addr',
    sortable: true
  },
  {
    name: 'Age',
    field: 'ageSec',
    sortable: true
  },
  {
    name: 'Name',
    field: 'name',
    sortable: true
  },
  {
    name: 'Idle',
    field: 'idleSec',
    sortable: true
  },
  {
    name: 'User',
    field: 'user',
    sortable: true
  }
]

const clientsData = {
  '03256': {
    addr: '172.17.0.1:56982',
    name: 'redis-di-cli',
    ageSec: 1,
    idleSec: 0,
    user: 'default'
  },
  9875: {
    addr: '172.16.0.2:62356',
    name: 'redis-di-cli',
    ageSec: 100,
    idleSec: 2,
    user: 'default'
  },
  56456: {
    addr: '172.15.0.3:95473',
    name: 'redis-di-cli',
    ageSec: 60,
    idleSec: 1,
    user: 'default'
  }
}

const Clients = () => {
  const clients = Object.keys(clientsData).map((key) => ({
    id: key,
    ...clientsData[key]
  }))

  return (
    <Panel>
      <Accordion id="clients" title="Clients">
        <Table<Client> id="clients" columns={columns} items={clients} initialSortField="id" />
      </Accordion>
    </Panel>
  )
}

export default Clients
