import { EuiTableFieldDataColumnType, EuiToolTip } from '@elastic/eui'
import React from 'react'

import { IDataStreams } from 'uiSrc/slices/interfaces'
import { formatLongName } from 'uiSrc/utils'
import { FormatedDate } from 'uiSrc/components'
import Accordion from '../components/accordion'
import Panel from '../components/panel'
import Table from '../components/table'

type DataStreamsData = {
  name: string
  total: number
  pending: number
  inserted: number
  updated: number
  deleted: number
  filtered: number
  rejected: number
  deduplicated: number
  lastArrival?: string
}

interface Props {
  data: IDataStreams
  loading: boolean
  onRefresh: () => void
  onRefreshClicked: () => void
  onChangeAutoRefresh: (enableAutoRefresh: boolean, refreshRate: string) => void
}

const DataStreams = ({ data, loading, onRefresh, onRefreshClicked, onChangeAutoRefresh }: Props) => {
  const dataStreams = Object.keys(data?.streams || {}).map((key) => {
    const dataStream = data.streams[key]
    return {
      name: key,
      ...dataStream
    }
  })

  const totals = data?.totals

  const columns: EuiTableFieldDataColumnType<DataStreamsData>[] = [
    {
      name: 'Stream name',
      field: 'name',
      sortable: true,
      render: (name: string) => (
        <EuiToolTip content={name}>
          <span>{formatLongName(name, 30, 0, '...')}</span>
        </EuiToolTip>
      ),
      width: '20%',
      footer: 'Total',
    },
    {
      name: 'Total',
      field: 'total',
      sortable: true,
      footer: () => totals?.total || '0',
    },
    {
      name: 'Pending',
      field: 'pending',
      sortable: true,
      footer: () => totals?.pending || '0',
    },
    {
      name: 'Inserted',
      field: 'inserted',
      sortable: true,
      footer: () => totals?.inserted || '0',
    },
    {
      name: 'Updated',
      field: 'updated',
      sortable: true,
      footer: () => totals?.updated || '0',
    },
    {
      name: 'Deleted',
      field: 'deleted',
      sortable: true,
      footer: () => totals?.deleted || '0',
    },
    {
      name: 'Filtered',
      field: 'filtered',
      sortable: true,
      footer: () => totals?.filtered || '0',
    },
    {
      name: 'Rejected',
      field: 'rejected',
      sortable: true,
      footer: () => totals?.rejected || '0',
    },
    {
      name: 'Deduplicated',
      field: 'deduplicated',
      sortable: true,
      footer: () => totals?.deduplicated || '0',
    },
    {
      name: 'Last arrival',
      field: 'lastArrival',
      render: (dateStr) => (
        <FormatedDate date={dateStr} />
      ),
      sortable: true,
      footer: '',
    }
  ]

  return (
    <Panel>
      <Accordion
        id="data-streams"
        title="Data streams overview"
        hideAutoRefresh
        loading={loading}
        onRefresh={onRefresh}
        onRefreshClicked={onRefreshClicked}
        onChangeAutoRefresh={onChangeAutoRefresh}
      >
        <Table<DataStreamsData> id="data-streams" columns={columns} items={dataStreams} initialSortField="name" />
      </Accordion>
    </Panel>
  )
}

export default DataStreams
