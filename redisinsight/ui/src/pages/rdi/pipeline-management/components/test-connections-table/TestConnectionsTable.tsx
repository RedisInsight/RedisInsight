import React from 'react'
import { Table, ColumnDefinition } from 'uiSrc/components/base/layout/table'

import { IRdiConnectionResult } from 'uiSrc/slices/interfaces'

import styles from './styles.module.scss'

export interface Props {
  data: Array<IRdiConnectionResult>
}

const TestConnectionsTable = (props: Props) => {
  const { data } = props

  const columns: ColumnDefinition<IRdiConnectionResult>[] = [
    {
      header: 'Name',
      id: 'target',
      accessorKey: 'target',
      cell: ({
        row: {
          original: { target },
        },
      }) => <div data-testid={`table-target-${target}`}>{target}</div>,
    },
    {
      header: 'Result',
      id: 'error',
      accessorKey: 'error',
      cell: ({
        row: {
          original: { target, error },
        },
      }) => (
        <div data-testid={`table-result-${target}`}>
          {error || 'Successful'}
        </div>
      ),
    },
  ]

  if (data?.length === 0) return null

  return (
    <div className={styles.tableWrapper}>
      <Table
        columns={columns}
        data={data ?? []}
        defaultSorting={[]}
        data-testid="connections-log-table"
      />
    </div>
  )
}

export default TestConnectionsTable
