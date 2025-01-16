/* eslint-disable react/prop-types */
import React, { ReactElement, useEffect, useState } from 'react'
import cx from 'classnames'
import { toUpper, flatten, isArray, isEmpty, map, uniq } from 'lodash'
import {
  EuiBasicTableColumn,
  EuiIcon,
  EuiInMemoryTable,
  EuiLoadingContent,
  EuiText,
  EuiTextColor,
} from '@elastic/eui'

import GroupBadge from '../GroupBadge'
import { InfoAttributesBoolean } from '../../constants'

export interface Props {
  query: string
  result: any
}

const loadingMessage = 'loading...'
const noResultsMessage = 'No results found.'
const noOptionsMessage = 'No options found'

const TableInfoResult = React.memo((props: Props) => {
  const { result: resultProp, query } = props

  const [result, setResult] = useState(resultProp)

  const [items, setItems] = useState([])

  useEffect(() => {
    setResult(resultProp)

    const items = resultProp?.attributes || resultProp?.fields
    if (!items?.length) {
      return
    }

    setItems(items)
  }, [resultProp, query])

  const isBooleanColumn = (title = '') => InfoAttributesBoolean.indexOf(title) !== -1

  const uniqColumns = uniq(flatten(map(items, (item) => Object.keys(item)))) ?? []

  const columns: EuiBasicTableColumn<any>[] = uniqColumns.map((title: string = ' ') => ({
    field: title,
    name: toUpper(title),
    truncateText: true,
    align: isBooleanColumn(title) ? 'center' : 'left',
    'data-testid': `query-column-${title}`,
    // sortable: (value) => (value[title] ? value[title].toLowerCase() : Infinity),
    render: function Cell(initValue?: string): ReactElement | null {
      if (isBooleanColumn(title)) {
        return (
          <div className="icon">
            <EuiIcon type={initValue ? 'check' : 'cross'} color={initValue ? 'primary' : 'danger'} />
          </div>
        )
      }

      return <EuiText>{initValue}</EuiText>
    },
  }))

  const Header = () => (
    <div>
      {result ? (
        <>
          <EuiText className="row" size="s" color="subdued">
            Indexing
            <GroupBadge type={result?.index_definition?.key_type?.toLowerCase()} className="badge" />
            documents prefixed by
            {' '}
            {result?.index_definition?.prefixes?.map((prefix: any) => `"${prefix}"`).join(',')}
          </EuiText>
          <EuiText className="row" size="s" color="subdued">
            Options:
            {' '}
            {result?.index_options?.length
              ? <EuiTextColor style={{ color: 'var(--euiColorFullShade)' }}>{result?.index_options?.join(', ')}</EuiTextColor>
              : <span className="italic">{noOptionsMessage}</span> }

          </EuiText>
        </>
      ) : (
        <EuiLoadingContent lines={2} />
      )}
    </div>
  )
  const Footer = () => (
    <div>
      {result ? (
        <EuiText className="row" size="s" color="subdued">
          {`Number of docs: ${result?.num_docs || '0'} (max ${result?.max_doc_id || '0'}) | `}
          {`Number of records: ${result?.num_records || '0'} | `}
          {`Number of terms: ${result?.num_terms || '0'}`}
        </EuiText>
      ) : (
        <EuiLoadingContent lines={1} />
      )}
    </div>
  )

  const isDataArr = !React.isValidElement(result) && !(isArray(result) && isEmpty(result))
  const isDataEl = React.isValidElement(result)

  return (
    <div className="container">
      {isDataArr && (
        <div className="content">
          {Header()}
          <EuiInMemoryTable
            items={items ?? []}
            loading={!result}
            message={loadingMessage}
            columns={columns}
            className={cx('inMemoryTableDefault', 'tableInfo', {
              tableWithPagination: result?.length > 10,
            })}
            responsive={false}
            data-testid={`query-table-result-${query}`}
          />
          {Footer()}
        </div>
      )}
      {isDataEl && <div className={cx('resultEl')}>{result}</div>}
      {!isDataArr && !isDataEl && (
        <div className={cx('resultEl')} data-testid="query-table-no-results">
          {noResultsMessage}
        </div>
      )}
    </div>
  )
})

export default TableInfoResult
