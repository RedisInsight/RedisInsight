import React, { useEffect, useState } from 'react'
import cx from 'classnames'
import {
  EuiBasicTableColumn,
  EuiInMemoryTable,
} from '@elastic/eui'

export interface Props {
  query: string;
  result: any;
  matched?: number;
}

const noResultMessage = 'No results'

const TableResult = React.memo((props: Props) => {
  const { result, query } = props

  const [columns, setColumns] = useState<EuiBasicTableColumn<any>[]>([])

  useEffect(() => {
    if (!result?.length) {
      return
    }

    const newColumns = Object.keys(result[0]).map((item) => ({
      field: item,
      name: item,
      truncateText: true,
    }))

    setColumns(newColumns)
  }, [result, query])

  return (
    <div className={cx('queryResultsContainer', 'container')}>
      <EuiInMemoryTable
        pagination
        items={result ?? []}
        loading={!result}
        message={noResultMessage}
        columns={columns}
        className={cx(
          {
            table: true,
            inMemoryTableDefault: true,
            tableWithPagination: result?.length > 10,
          }
        )}
        responsive={false}
        data-testid={`query-table-result-${query}`}
      />
    </div>
  )
})

export default TableResult
