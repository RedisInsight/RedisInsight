import { EuiBasicTableColumn, EuiInMemoryTable } from '@elastic/eui'
import cx from 'classnames'
import React from 'react'

import { ErrorImportResult } from 'uiSrc/slices/interfaces'
import { Maybe } from 'uiSrc/utils'

import styles from './styles.module.scss'

export interface DataImportResult {
  index: number
  status: string
  errors?: Array<ErrorImportResult>
  host?: string
  port?: number
}
export interface Props {
  data: Array<DataImportResult>
}

const TableResult = (props: Props) => {
  const { data } = props

  const ErrorResult = ({ errors }: { errors: string[] }) => (
    <ul>
      {errors.map((message, i) => (
        <li key={String(Math.random() * i)}>{message}</li>
      ))}
    </ul>
  )

  const columns: EuiBasicTableColumn<any>[] = [
    {
      name: '#',
      field: 'index',
      width: '4%',
      render: (index: number) => (<span data-testid={`table-index-${index}`}>({index})</span>)
    },
    {
      name: 'Host:Port',
      field: 'host',
      width: '25%',
      truncateText: true,
      render: (_host, { host, port, index }) => (<div data-testid={`table-host-port-${index}`}>{host}:{port}</div>)
    },
    {
      name: 'Result',
      field: 'errors',
      width: '25%',
      render: (errors: Maybe<ErrorImportResult[]>, { index }) => (
        <div data-testid={`table-result-${index}`}>
          {errors ? (<ErrorResult errors={errors.map((e) => e.message)} />) : 'Successful'}
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
        data-testid="result-log-table"
      />
    </div>
  )
}

export default TableResult
