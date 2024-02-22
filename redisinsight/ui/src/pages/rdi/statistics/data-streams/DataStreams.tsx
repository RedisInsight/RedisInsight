import React from 'react'

import { EuiBasicTableColumn } from '@elastic/eui'
import Accordion from '../components/accordion'
import Panel from '../components/panel'
import Table from '../components/table'

type DataStream = {
  name: string
  total: number
  pending: number
  inserted: number
  updated: number
  deleted: number
  filtered: number
  rejected: number
  deduplicated: number
  lastArrival: string
}

const columns: EuiBasicTableColumn<DataStream>[] = [
  {
    name: 'Stream name',
    field: 'name',
    sortable: true
  },
  {
    name: 'Total',
    field: 'total',
    sortable: true
  },
  {
    name: 'Pending',
    field: 'pending',
    sortable: true
  },
  {
    name: 'Inserted',
    field: 'inserted',
    sortable: true
  },
  {
    name: 'Updated',
    field: 'updated',
    sortable: true
  },
  {
    name: 'Deleted',
    field: 'deleted',
    sortable: true
  },
  {
    name: 'Filtered',
    field: 'filtered',
    sortable: true
  },
  {
    name: 'Rejected',
    field: 'rejected',
    sortable: true
  },
  {
    name: 'Deduplicated',
    field: 'deduplicated',
    sortable: true
  },
  {
    name: 'Last arrival',
    field: 'lastArrival',
    sortable: true
  }
]

const streamsData = {
  Stream1: {
    total: 35,
    pending: 2,
    inserted: 2530,
    updated: 65165,
    deleted: 1,
    filtered: 0,
    rejected: 5,
    deduplicated: 0,
    lastArrival: '1 Hour'
  },
  Stream2: {
    total: 150,
    pending: 13,
    inserted: 178,
    updated: 454665,
    deleted: 22,
    filtered: 8,
    rejected: 5,
    deduplicated: 1,
    lastArrival: '3.5 min'
  },
  Stream3: {
    total: 2,
    pending: 0,
    inserted: 1483,
    updated: 65494,
    deleted: 6,
    filtered: 0,
    rejected: 6,
    deduplicated: 0,
    lastArrival: '2 min'
  }
}

const DataStreams = () => {
  const dataStreams = Object.keys(streamsData).map((key) => ({
    name: key,
    ...streamsData[key]
  }))

  return (
    <Panel>
      <Accordion id="data-streams" title="Data streams overview">
        <Table<DataStream> id="data-streams" columns={columns} items={dataStreams} initialSortField="name" />
      </Accordion>
    </Panel>
  )
}

export default DataStreams
