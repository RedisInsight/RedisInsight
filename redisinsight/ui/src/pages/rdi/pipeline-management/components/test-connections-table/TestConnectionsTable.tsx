import { EuiBasicTableColumn, EuiInMemoryTable } from '@elastic/eui'
import cx from 'classnames'
import React from 'react'

import { Maybe } from 'uiSrc/utils'
import { TestConnectionResult, TestConnectionStatus } from 'uiSrc/slices/interfaces'

import styles from './styles.module.scss'

export interface Props {
  data: Array<TestConnectionResult>
}

const TestConnectionsTable = (props: Props) => {
  const { data } = props

  const columns: EuiBasicTableColumn<any>[] = [
    {
      name: '#',
      field: 'index',
      width: '4%',
      render: (index: number) => (<span data-testid={`table-index-${index}`}>({index})</span>)
    },
    {
      name: 'Endpoint',
      field: 'endpoint',
      width: '48%',
      truncateText: true,
      render: (endpoint: string, { index }) => (<div data-testid={`table-endpoint-${index}`}>{endpoint}</div>)
    },
    {
      name: 'Result',
      field: 'error',
      width: '48%',
      truncateText: true,
      render: (error: Maybe<string>, { status, index }) => (
        <div data-testid={`table-result-${index}`}>
          {status === TestConnectionStatus.Fail ? error || 'Error' : 'Successful'}
        </div>
      )
    }
  ]

  if (data?.length === 0) return null

  return (
    <div className={styles.tableWrapper}>
      <EuiInMemoryTable
        items={data ?? []}
        columns={columns}
        className={cx('inMemoryTableDefault', 'noBorders', 'stickyHeader', styles.table)}
        responsive={false}
        itemId="index"
        data-testid="connections-log-table"
      />
    </div>
  )
}

export default TestConnectionsTable
