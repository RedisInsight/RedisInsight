import { Criteria, EuiBasicTableColumn, EuiInMemoryTable, PropertySort } from '@elastic/eui'
import React, { useState } from 'react'

import styles from './styles.module.scss'

export interface Props<T> {
  id: string
  columns: EuiBasicTableColumn<T>[]
  items: T[]
  initialSortField: string
}

const Table = <T,>({ id, columns, items, initialSortField }: Props<T>) => {
  const [sort, setSort] = useState<PropertySort>({ field: initialSortField, direction: 'asc' })

  return (
    <EuiInMemoryTable
      data-testid={`${id}-table`}
      className={styles.table}
      items={items}
      columns={columns}
      sorting={{ sort }}
      onTableChange={({ sort }: Criteria<T>) => {
        setSort(sort as PropertySort)
      }}
    />
  )
}

export default Table
