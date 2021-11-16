import React, { useCallback, useEffect, useRef, useState } from 'react'
import cx from 'classnames'
import { InfiniteLoader, Table, Column, IndexRange } from 'react-virtualized'
import { findIndex, isNumber } from 'lodash'
import {
  EuiText,
  EuiProgress,
  EuiResizeObserver,
  EuiIcon,
  EuiTextColor,
  EuiButton,
} from '@elastic/eui'

import { Maybe, Nullable } from 'uiSrc/utils'
import { SortOrder } from 'uiSrc/constants'
import { SCAN_COUNT_DEFAULT } from 'uiSrc/constants/api'
import { numberWithSpaces } from 'uiSrc/utils/numbers'
import TableColumnSearch from 'uiSrc/components/table-column-search/TableColumnSearch'
import TableColumnSearchTrigger from 'uiSrc/components/table-column-search-trigger/TableColumnSearchTrigger'
import { IColumnSearchState, IProps, IResizeEvent, ITableColumn } from './interfaces'

import styles from './styles.module.scss'

const VirtualTable = (props: IProps) => {
  const {
    headerHeight = 44,
    rowHeight = 40,
    scanned = 0,
    totalItemsCount = 0,
    totalSize = 0,
    onRowClick = () => {},
    onSearch = () => {},
    onChangeSorting = () => {},
    sortedColumn = null,
    selectedKey = null,
    noItemsMessage = 'No keys to display.',
    searching,
    loading,
    columns,
    items,
    disableScroll,
    onWheel,
    keyName,
    loadMoreItems,
    setScrollTopPosition = () => {},
    scrollTopProp = 0
  } = props
  const scrollTopRef = useRef<number>(0)
  const [selectedRowIndex, setSelectedRowIndex] = useState<Nullable<number>>(null)
  const [search, setSearch] = useState<IColumnSearchState[]>([])
  const [width, setWidth] = useState<number>(100)
  const [height, setHeight] = useState<number>(100)
  const [forceScrollTop, setForceScrollTop] = useState<Maybe<number>>(scrollTopProp)

  useEffect(() => {
    const searchableFields: ITableColumn[] = columns.filter(
      (column: ITableColumn) => column.isSearchable
    )
    searchableFields.forEach((column) => {
      setSearch([
        ...search,
        {
          id: column.id,
          value: column.initialSearchValue ?? '',
          initialSearchValue: column.initialSearchValue ?? '',
          isOpened: !!column.staySearchAlwaysOpen || !!column.isSearchOpen,
          staySearchAlwaysOpen: !!column.staySearchAlwaysOpen,
          prependSearchName: column.prependSearchName ?? '',
          searchValidation: column.searchValidation,
        },
      ])
    })

    return () => {
      setScrollTopPosition(scrollTopRef.current)
    }
  }, [])

  useEffect(() => {
    if (forceScrollTop !== undefined) {
      setForceScrollTop(undefined)
    }
  }, [forceScrollTop])

  useEffect(() => {
    const selectedRowIndex = selectedKey ? findIndex(items, { name: selectedKey.name }) : null
    setSelectedRowIndex(isNumber(selectedRowIndex) && selectedRowIndex > -1 ? selectedRowIndex : null)
  }, [selectedKey, items])

  const onRowSelect = (data: any) => {
    const isRowSelectable = checkIfRowSelectable(data.rowData)

    onRowClick(data)
    if (isRowSelectable) {
      setSelectedRowIndex(data.index)
    }
  }

  const onScroll = useCallback(
    ({ scrollTop }) => {
      scrollTopRef.current = scrollTop
    },
    [scrollTopRef],
  )

  const onResize = ({ height, width }: IResizeEvent): void => {
    setHeight(height)
    setWidth(width)
  }

  const checkIfRowSelectable = (rowData: any) => !!rowData

  const cellRenderer = ({ cellData, columnIndex, rowData }: any) => {
    const column = columns[columnIndex]
    if (column.render) {
      return (
        <div className={styles.tableRowCell} style={{ justifyContent: column.alignment }}>
          {column.render(cellData, rowData)}
        </div>
      )
    }
    return (
      <div className={styles.tableRowCell} style={{ justifyContent: column.alignment }}>
        <EuiText color="subdued" style={{ maxWidth: '100%' }}>
          <div style={{ display: 'flex' }} className={column.truncateText ? 'truncateText' : ''}>
            {cellData}
          </div>
        </EuiText>
      </div>
    )
  }

  const changeSorting = (column: any) => {
    if (!sortedColumn || !sortedColumn.column || sortedColumn.column !== column) {
      onChangeSorting(column, SortOrder.DESC)
      return
    }
    onChangeSorting(
      column,
      sortedColumn.order === SortOrder.DESC ? SortOrder.ASC : SortOrder.DESC
    )
  }

  const headerRenderer = ({ columnIndex }: any) => {
    const column = columns[columnIndex]
    const isColumnSorted = sortedColumn && sortedColumn.column === column.id

    return (
      <div className="flex-row fluid" style={{ justifyContent: column.alignment }}>
        {column.isSortable && !searching && (
          <div className={styles.headerCell} style={{ justifyContent: column.alignment }}>
            <button
              type="button"
              onClick={() => changeSorting(column.id)}
              className={cx(
                styles.headerButton,
                isColumnSorted ? styles.headerButtonSorted : null,
              )}
              data-testid="score-button"
              style={{ justifyContent: column.alignment }}
            >
              <EuiText size="m">{column.label}</EuiText>
            </button>
          </div>
        )}
        {(!column.isSortable || (column.isSortable && searching)) && (
          <div className={cx(styles.headerCell, 'relative')} style={{ flex: '1' }}>
            <div
              style={{
                justifyContent: column.alignment,
                textAlign: column.textAlignment,
                flex: '1',
              }}
            >
              <EuiText size="m">{column.label}</EuiText>
            </div>
            {column.isSearchable && searchRenderer(column)}
          </div>
        )}
        {isColumnSorted && !searching && (
          <div className={styles.headerCell} style={{ paddingLeft: 0 }}>
            <button
              type="button"
              onClick={() => changeSorting(column.id)}
              className={cx(
                styles.headerButton,
                isColumnSorted ? styles.headerButtonSorted : null,
              )}
            >
              <EuiIcon
                style={{ marginLeft: '4px' }}
                type={sortedColumn?.order === SortOrder.DESC ? 'sortDown' : 'sortUp'}
              />
            </button>
          </div>
        )}
      </div>
    )
  }

  const noRowsRenderer = () => (
    <>
      {noItemsMessage && (
        <div className={styles.placeholder}>
          <EuiText textAlign="center" grow color="subdued" size="m">
            <div>{loading ? 'loading...' : noItemsMessage}</div>
          </EuiText>
        </div>
      )}
    </>
  )

  const loadMoreRows = async (params: IndexRange): Promise<any> => {
    const { startIndex, stopIndex } = params

    // We do not load more results for first load
    if (forceScrollTop !== undefined) return

    if (!loading) {
      loadMoreItems({ keyName, startIndex, stopIndex })
    }
  }

  const isRowLoaded = ({ index }: any) => !!items[index]

  const handleColumnSearchVisibility = (columnId: string, isOpened: boolean) => {
    const newSearch = search.map((column) => {
      if (column.id === columnId) {
        return {
          ...column,
          isOpened,
        }
      }
      return column
    })
    setSearch(newSearch)
  }

  const handleColumnSearchApply = (columnId: string, value: string) => {
    const newState = search.map((column) => {
      if (column.id === columnId) {
        return {
          ...column,
          isOpened: !!value,
          value,
        }
      }
      return column
    })
    setSearch(newState)
    onSearch?.(newState)
  }

  const searchRenderer = (column: ITableColumn) => {
    const columnSearchState = search.find((columnState) => columnState.id === column.id)
    if (!columnSearchState) {
      return null
    }
    if (columnSearchState.staySearchAlwaysOpen) {
      return (
        <TableColumnSearch
          appliedValue={columnSearchState.value}
          fieldName={columnSearchState.id}
          onApply={(value) => handleColumnSearchApply(column.id, value)}
          prependSearchName={columnSearchState.prependSearchName}
          searchValidation={columnSearchState.searchValidation}
        />
      )
    }
    return (
      <TableColumnSearchTrigger
        appliedValue={columnSearchState.value}
        initialValue={columnSearchState.initialSearchValue}
        fieldName={columnSearchState.id}
        onApply={(value) => handleColumnSearchApply(column.id, value)}
        isOpen={columnSearchState.isOpened}
        prependSearchName={columnSearchState.prependSearchName}
        handleOpenState={(isOpen) => handleColumnSearchVisibility(column.id, isOpen)}
        searchValidation={columnSearchState.searchValidation}
      />
    )
  }

  return (
    <EuiResizeObserver onResize={onResize}>
      {(resizeRef) => (
        <div
          ref={resizeRef}
          className={styles.container}
          onWheel={onWheel}
          data-testid="virtual-table-container"
        >
          {loading ? (
            <EuiProgress
              color="primary"
              size="xs"
              position="absolute"
              className={styles.progress}
              data-testid="progress-key-list"
            />
          ) : null}
          <InfiniteLoader
            isRowLoaded={isRowLoaded}
            minimumBatchSize={SCAN_COUNT_DEFAULT}
            threshold={100}
            loadMoreRows={loadMoreRows}
            rowCount={totalItemsCount}
          >
            {({ onRowsRendered, registerChild }) => (
              <Table
                onRowClick={onRowSelect}
                estimatedRowSize={rowHeight}
                ref={registerChild}
                onRowsRendered={onRowsRendered}
                headerHeight={headerHeight}
                rowHeight={rowHeight}
                width={width}
                noRowsRenderer={noRowsRenderer}
                height={height}
                className={styles.table}
                gridClassName={cx(styles.customScroll, {
                  [`${styles.disableScroll}`]: disableScroll,
                })}
                rowClassName={({ index }) =>
                  cx([
                    styles.tableRow,
                    {
                      'table-row-selected': selectedRowIndex === index,
                      [styles.tableRowEven]: index % 2 === 0,
                    },
                  ])}
                headerClassName={styles.headerColumn}
                rowCount={items.length}
                rowGetter={({ index }) => items[index]}
                onScroll={onScroll}
                scrollTop={forceScrollTop}
              >
                {columns.map((column: ITableColumn, index: number) => (
                  <Column
                    minWidth={column.minWidth}
                    label={column.label}
                    dataKey={column.id}
                    width={
                      column.absoluteWidth || column.relativeWidth
                        ? width * (column.relativeWidth)
                        : 20
                    }
                    flexGrow={!column.absoluteWidth && !column.relativeWidth ? 1 : 0}
                    headerRenderer={(headerProps) =>
                      headerRenderer({
                        ...headerProps,
                        columnIndex: index,
                      })}
                    cellRenderer={cellRenderer}
                    headerClassName={column.headerClassName ?? ''}
                    className={cx(styles.tableRowColumn, column.className ?? '')}
                    key={column.id}
                  />
                ))}
              </Table>
            )}
          </InfiniteLoader>
          {!!(totalItemsCount || totalSize) && (
            <div className={styles.tableFooter}>
              {!!totalItemsCount && (
                <EuiText size="xs">
                  {scanned ? (
                    <>
                      <EuiTextColor className="eui-alignMiddle">
                        <b>
                          Results:&nbsp;
                          <span data-testid="keys-number-of-results">{numberWithSpaces(items.length)}</span>
                          {' '}
                          key
                          {items.length === 1 ? '' : 's'}
                          .&nbsp;
                        </b>
                        <EuiTextColor color="subdued">
                          Scanned
                          {' '}
                          <span data-testid="keys-number-of-scanned">{numberWithSpaces(scanned)}</span>
                          {' '}
                          /
                          {' '}
                          <span data-testid="keys-total">{numberWithSpaces(totalItemsCount)}</span>
                          {' '}
                          keys
                          <span
                            className={cx([styles.loading, { [styles.loadingShow]: loading }])}
                          />
                        </EuiTextColor>
                      </EuiTextColor>
                      {scanned < totalItemsCount && (
                        <EuiButton
                          fill
                          size="s"
                          color="secondary"
                          style={{ marginLeft: 25, height: 26 }}
                          disabled={loading}
                          onClick={() =>
                            loadMoreRows({
                              stopIndex: SCAN_COUNT_DEFAULT - 1,
                              startIndex: 0,
                            })}
                          data-testid="scan-more"
                        >
                          Scan more
                        </EuiButton>
                      )}
                    </>
                  ) : (
                    <EuiText size="xs">
                      <b>
                        Total:&nbsp;
                        {numberWithSpaces(totalItemsCount)}
                      </b>
                    </EuiText>
                  )}
                </EuiText>
              )}
              {!!totalSize && (
                <div>
                  <EuiText size="xs">
                    <b>Total Size:</b>
                    {' '}
                    {totalSize / 1000}
                    kB
                  </EuiText>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </EuiResizeObserver>
  )
}

export default VirtualTable
