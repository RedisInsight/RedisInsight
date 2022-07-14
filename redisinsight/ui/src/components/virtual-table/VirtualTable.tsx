import React, { useCallback, useEffect, useRef, useState } from 'react'
import cx from 'classnames'
import { InfiniteLoader,
  Table,
  Column,
  IndexRange,
  CellMeasurer,
  TableCellProps,
  CellMeasurerCache,
  RowMouseEventHandlerParams,
} from 'react-virtualized'
import { findIndex, isNumber, xor } from 'lodash'
import {
  EuiText,
  EuiProgress,
  EuiResizeObserver,
  EuiIcon,
} from '@elastic/eui'

import { Maybe, Nullable } from 'uiSrc/utils'
import { SortOrder } from 'uiSrc/constants'
import { SCAN_COUNT_DEFAULT } from 'uiSrc/constants/api'
import TableColumnSearch from 'uiSrc/components/table-column-search/TableColumnSearch'
import TableColumnSearchTrigger from 'uiSrc/components/table-column-search-trigger/TableColumnSearchTrigger'
import { IColumnSearchState, IProps, IResizeEvent, ITableColumn } from './interfaces'
import KeysSummary from '../keys-summary'

import styles from './styles.module.scss'

const VirtualTable = (props: IProps) => {
  const {
    selectable = false,
    expandable = false,
    headerHeight = 44,
    rowHeight = 40,
    scanned = 0,
    totalItemsCount = 0,
    onRowClick = () => {},
    onSearch = () => {},
    onChangeSorting = () => {},
    onRowToggleViewClick = () => {},
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
    scrollTopProp = 0,
    hideFooter = false,
    tableWidth = 0,
    hideProgress,
    onChangeWidth = () => {},
    cellCache = new CellMeasurerCache({
      fixedWidth: true,
      minHeight: rowHeight,
    }),
  } = props
  let selectTimer: number = 0
  const selectTimerDelay = 300
  let preventSelect = false

  const scrollTopRef = useRef<number>(0)
  const [selectedRowIndex, setSelectedRowIndex] = useState<Nullable<number>>(null)
  const [search, setSearch] = useState<IColumnSearchState[]>([])
  const [expandedRows, setExpandedRows] = useState<number[]>([])
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
      setExpandedRows([])
      cellCache?.clearAll()
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

  useEffect(() => {
    setExpandedRows([])
    cellCache?.clearAll()
  }, [totalItemsCount])

  const onRowSelect = (data: RowMouseEventHandlerParams) => {
    const isRowSelectable = checkIfRowSelectable(data.rowData)

    onRowClick(data)
    if (isRowSelectable && selectable) {
      setSelectedRowIndex(data.index)
    }

    if (isRowSelectable && expandable) {
      selectTimer = window.setTimeout(() => {
        const textSelected = window.getSelection()?.toString()
        if (!preventSelect && !textSelected) {
          setExpandedRows(xor(expandedRows, [data.index]))
          onRowToggleViewClick?.(expandedRows.indexOf(data.index) === -1, data.index)
        }
        preventSelect = false
      }, selectTimerDelay, cellCache)

      if (data.event?.detail === 3) {
        clearSelectTimeout(selectTimer)
        preventSelect = false
      }

      cellCache.clearAll()
    }
  }
  const clearSelectTimeout = (timer: number = 0) => {
    clearTimeout(timer || selectTimer)
    preventSelect = true
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
    onChangeWidth?.(width)
    cellCache?.clearAll()
  }

  const checkIfRowSelectable = (rowData: any) => !!rowData

  const cellRenderer = ({ cellData, columnIndex, rowData, rowIndex, parent, dataKey }: TableCellProps) => {
    const column = columns[columnIndex]
    if (column.render) {
      return (
        <CellMeasurer
          cache={cellCache}
          columnIndex={columnIndex}
          rowIndex={rowIndex}
          parent={parent}
          key={rowIndex + columnIndex + dataKey}
        >
          <div
            className={styles.tableRowCell}
            style={{ justifyContent: column.alignment, wordBreak: 'break-all' }}
            role="presentation"
          >
            {column?.render?.(cellData, rowData, expandedRows.indexOf(rowIndex) !== -1)}
          </div>
        </CellMeasurer>
      )
    }
    return (
      <CellMeasurer
        cache={cellCache}
        columnIndex={columnIndex}
        rowIndex={rowIndex}
        parent={parent}
        key={rowIndex + columnIndex + dataKey}
      >
        <div className={styles.tableRowCell} style={{ justifyContent: column.alignment, whiteSpace: 'normal' }}>
          <EuiText color="subdued" style={{ maxWidth: '100%' }}>
            <div style={{ display: 'flex' }} className={column.truncateText ? 'truncateText' : ''}>
              {cellData}
            </div>
          </EuiText>
        </div>
      </CellMeasurer>
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

  const headerRenderer = ({ columnIndex, cellClass = '' }: any) => {
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
                cellClass,
                styles.headerButton,
                isColumnSorted ? styles.headerButtonSorted : null,
              )}
              data-testid="score-button"
              style={{ justifyContent: column.alignment }}
            >
              <EuiText size="m" className={cellClass}><span>{column.label}</span></EuiText>
            </button>
          </div>
        )}
        {(!column.isSortable || (column.isSortable && searching)) && (
          <div className={cx(styles.headerCell, cellClass, 'relative')} style={{ flex: '1' }}>
            <div
              style={{
                justifyContent: column.alignment,
                textAlign: column.textAlignment,
                flex: '1',
              }}
            >
              <EuiText size="m" className={cellClass}><span>{column.label}</span></EuiText>
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
              data-testid="header-sorting-button"
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
      loadMoreItems?.({ keyName, startIndex, stopIndex })
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
          {loading && !hideProgress && (
            <EuiProgress
              color="primary"
              size="xs"
              position="absolute"
              className={styles.progress}
              data-testid="progress-key-list"
            />
          )}
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
                onRowDoubleClick={() => clearSelectTimeout()}
                estimatedRowSize={rowHeight}
                ref={registerChild}
                onRowsRendered={onRowsRendered}
                headerHeight={headerHeight}
                rowHeight={cellCache.rowHeight}
                width={tableWidth > width ? tableWidth : width}
                noRowsRenderer={noRowsRenderer}
                height={height}
                className={styles.table}
                gridClassName={cx(styles.customScroll, styles.grid, {
                  [styles.disableScroll]: disableScroll,
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
                deferredMeasurementCache={cellCache}
              >
                {columns.map((column: ITableColumn, index: number) => (
                  <Column
                    minWidth={column.minWidth}
                    maxWidth={column.maxWidth}
                    label={column.label}
                    dataKey={column.id}
                    width={
                      column.absoluteWidth || column.relativeWidth
                        ? column.relativeWidth ?? 0
                        : 20
                    }
                    flexGrow={!column.absoluteWidth && !column.relativeWidth ? 1 : 0}
                    headerRenderer={(headerProps) =>
                      headerRenderer({
                        ...headerProps,
                        columnIndex: index,
                        cellClass: column.headerCellClassName,
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
          {!hideFooter && (
            <div className={cx(styles.tableFooter)}>
              <KeysSummary
                scanned={scanned}
                totalItemsCount={totalItemsCount}
                loading={loading}
                loadMoreItems={loadMoreItems}
                items={items}
              />
            </div>
          )}
        </div>
      )}
    </EuiResizeObserver>
  )
}

export default VirtualTable
