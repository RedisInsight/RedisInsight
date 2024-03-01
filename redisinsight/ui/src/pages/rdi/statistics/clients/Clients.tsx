import { EuiBasicTableColumn } from '@elastic/eui'
import React from 'react'

import { IClients } from 'uiSrc/slices/interfaces'
import Accordion from '../components/accordion'
import Panel from '../components/panel'
import Table from '../components/table'

type ClientsData = {
  id: string
  addr: string
  name: string
  ageSec: number
  idleSec: number
  user: string
}

const columns: EuiBasicTableColumn<ClientsData>[] = [
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

interface Props {
  data: IClients
  loading: boolean
  onRefresh: () => void
  onRefreshClicked: () => void
  onChangeAutoRefresh: (enableAutoRefresh: boolean, refreshRate: string) => void
}

const Clients = ({ data, loading, onRefresh, onRefreshClicked, onChangeAutoRefresh }: Props) => {
  const clients = Object.keys(data).map((key) => {
    const client = data[key]
    return {
      id: key,
      ...client
    }
  })

  return (
    <Panel>
      <Accordion
        id="clients"
        title="Clients"
        loading={loading}
        onRefresh={onRefresh}
        onRefreshClicked={onRefreshClicked}
        onChangeAutoRefresh={onChangeAutoRefresh}
      >
        <Table<ClientsData> id="clients" columns={columns} items={clients} initialSortField="id" />
      </Accordion>
    </Panel>
  )
}

export default Clients
