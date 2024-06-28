import { EuiBasicTableColumn, EuiInMemoryTable } from '@elastic/eui'
import cx from 'classnames'
import React from 'react'

import { Maybe } from 'uiSrc/utils'
import { IRdiConnectionResult } from 'uiSrc/slices/interfaces'

import styles from './styles.module.scss'

export interface Props {
  data: Array<IRdiConnectionResult>
}

const TestConnectionsTable = (props: Props) => {
  const { data } = props

  const columns: EuiBasicTableColumn<IRdiConnectionResult>[] = [
    {
      name: 'Name',
      field: 'target',
      width: '50%',
      truncateText: true,
      render: (target: string) => <div data-testid={`table-target-${target}`}>{target}</div>
    },
    {
      name: 'Result',
      field: 'error',
      width: '50%',
      truncateText: true,
      render: (error: Maybe<string>, { target }) => (
        <div data-testid={`table-result-${target}`}>
          {error || 'Successful'}
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
