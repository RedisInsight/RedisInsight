import React, { ReactElement, useEffect, useState } from 'react'
import parse from 'html-react-parser'
import cx from 'classnames'
import { flatten, isArray, isEmpty, map, uniq } from 'lodash'
import {
  EuiBasicTableColumn,
  EuiButtonIcon,
  EuiInMemoryTable,
  EuiTextColor,
  EuiToolTip,
} from '@elastic/eui'

import { CommandArgument, Command } from '../../constants'
import { formatLongName, replaceSpaces } from '../../utils'

export interface Props {
  query: string
  result: any
  matched?: number
  cursorId?: null | number
}

const loadingMessage = 'loading...'
const noResultsMessage = 'No results found.'

const TableResult = React.memo((props: Props) => {
  const { result, query, matched, cursorId } = props

  const [columns, setColumns] = useState<EuiBasicTableColumn<any>[]>([])

  const checkShouldParsedHTML = (query: string) => {
    const command = query.toUpperCase()
    return (
      command.startsWith(Command.Search)
      && command.includes(CommandArgument.Highlight)
    )
  }

  const handleCopy = (event: React.MouseEvent, text: string) => {
    event.preventDefault()
    event.stopPropagation()

    navigator.clipboard.writeText(text)
  }

  useEffect(() => {
    if (!result?.length) {
      return
    }

    const shouldParsedHTML = checkShouldParsedHTML(query)
    const uniqColumns = uniq(flatten(map(result, (doc) => Object.keys(doc)))) ?? []

    const newColumns: EuiBasicTableColumn<any>[] = uniqColumns.map((title: string = ' ') => ({
      field: title,
      name: title,
      truncateText: true,
      dataType: 'string',
      'data-testid': `query-column-${title}`,
      // sortable: (value) => (value[title] ? value[title].toLowerCase() : Infinity),
      render: function Cell(initValue: string = ''): ReactElement | string {
        if (!initValue || (isArray(initValue) && isEmpty(initValue))) {
          return ''
        }

        const value = initValue.toString()
        let cellContent: string | JSX.Element | JSX.Element[] = replaceSpaces(
          initValue.toString().substring(0, 200)
        )

        if (shouldParsedHTML) {
          cellContent = parse(cellContent)
        }

        return (
          <div role="presentation" className={cx('tooltipContainer')}>
            <EuiToolTip
              position="bottom"
              title={title}
              className="text-multiline-ellipsis"
              anchorClassName={cx('tooltip')}
              content={formatLongName(value.toString())}
            >
              <div className="copy-btn-wrapper">
                <EuiTextColor className={cx('cell')}>{cellContent}</EuiTextColor>
                <EuiButtonIcon
                  iconType="copy"
                  aria-label="Copy result"
                  className="copy-near-btn"
                  onClick={(event: React.MouseEvent) => handleCopy(event, initValue)}
                />
              </div>
            </EuiToolTip>
          </div>
        )
      },
    }))

    setColumns(newColumns)
  }, [result, query])

  const isDataArr = !React.isValidElement(result) && !(isArray(result) && isEmpty(result))
  const isDataEl = React.isValidElement(result)

  return (
    <div className={cx('queryResultsContainer', 'container')}>
      <div className="queryHeader">
        {!!matched && <div className={cx('matched')}>{`Matched: ${matched}`}</div>}
        {!!cursorId && <div className={cx('matched')}>{`Cursor ID: ${cursorId}`}</div>}
      </div>
      {isDataArr && (
        <EuiInMemoryTable
          pagination
          items={result ?? []}
          loading={!result}
          message={loadingMessage}
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
      )}
      {isDataEl && (
        <div className={cx('resultEl')}>{result}</div>
      )}
      {!isDataArr && !isDataEl && (
        <div className={cx('resultEl')} data-testid="query-table-no-results">
          {noResultsMessage}
        </div>
      )}
    </div>
  )
})

export default TableResult
