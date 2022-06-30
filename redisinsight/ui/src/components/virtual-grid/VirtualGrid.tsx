import React, { useCallback, useEffect, useRef, useState } from 'react'
import cx from 'classnames'
import AutoSizer, { Size } from 'react-virtualized-auto-sizer'
import { isObject } from 'lodash'
import { EuiProgress, EuiIcon, EuiText } from '@elastic/eui'
import InfiniteLoader from 'react-window-infinite-loader'
import { VariableSizeGrid as Grid, GridChildComponentProps } from 'react-window'

import { Maybe } from 'uiSrc/utils'
import { SortOrder } from 'uiSrc/constants'
import { SCAN_COUNT_DEFAULT } from 'uiSrc/constants/api'
import { IProps } from './interfaces'
import { useInnerElementType } from './utils'

import styles from './styles.module.scss'

const loadingMsg = 'loading...'
const scrollWidth = 16

const VirtualGrid = (props: IProps) => {
  const {
    rowHeight = 40,
    totalItemsCount = 0,
    onChangeSorting = () => {},
    sortedColumn = null,
    noItemsMessage = 'No items to display.',
    loading,
    columns = [],
    items = [],
    onWheel,
    keyName,
    loadMoreItems,
    setScrollTopPosition = () => {},
    scrollTopProp = 0,
    maxTableWidth = 0,
    hideProgress,
  } = props

  const scrollTopRef = useRef<number>(0)
  const [width, setWidth] = useState<number>(100)
  const [height, setHeight] = useState<number>(100)
  const [forceScrollTop, setForceScrollTop] = useState<Maybe<number>>(scrollTopProp)

  useEffect(() =>
    () => {
      setScrollTopPosition(scrollTopRef.current)
    }, [])

  useEffect(() => {
    if (forceScrollTop !== undefined) {
      setForceScrollTop(undefined)
    }
  }, [forceScrollTop])

  const onScroll = useCallback(
    ({ scrollTop }) => {
      scrollTopRef.current = scrollTop
    },
    [scrollTopRef],
  )

  const changeSorting = (column: any) => {
    if (!sortedColumn || !sortedColumn.column || sortedColumn.column !== column) {
      onChangeSorting(column, SortOrder.DESC)
      return
    }
    onChangeSorting(column, sortedColumn.order === SortOrder.DESC ? SortOrder.ASC : SortOrder.DESC)
  }

  const loadMoreRows = async (startIndex:number, stopIndex:number): Promise<any> => {
    // We do not load more results for first load
    if (forceScrollTop !== undefined) return

    if (!loading) {
      loadMoreItems?.({ keyName, startIndex, stopIndex })
    }
  }

  const columnWidth = (i: number) => {
    if (maxTableWidth < width) {
      const growingColumnsWidth = columns
        .filter(({ maxWidth = 0 }) => maxWidth)
        .map(({ maxWidth }) => maxWidth)
      const scrollOffset = height < rowHeight * items.length ? scrollWidth : 0

      const growingColumnsCount = columns.length - growingColumnsWidth.length
      const maxWidthTable = growingColumnsWidth?.reduce((a = 0, b = 0) => a + b, 0) ?? 0
      const newColumns = columns.map((column) => {
        const { minWidth, maxWidth = 0 } = column

        const newMinWidth = ((width - maxWidthTable - scrollOffset) / growingColumnsCount)

        return {
          ...column,
          minWidth: maxWidth
            ? minWidth
            : newMinWidth
        }
      })

      return newColumns[i].minWidth
    }
    return columns[i].minWidth
  }

  const onResize = ({ height, width }: Size): void => {
    setHeight(height)
    setWidth(width)
  }

  const Cell = ({ columnIndex, rowIndex, style }: GridChildComponentProps<null>) => {
    const rowData = items[rowIndex]
    const column = columns[columnIndex]
    const content: any = rowData?.[column?.id] || ''

    if (rowIndex === 0) {
      return (
        <div style={style}>
          <div className={cx(styles.gridHeaderItem, 'truncateText')}>
            {isObject(content) && (
              <>
                {!!content?.sortable && (
                  <button
                    type="button"
                    data-testid="header-sorting-button"
                    className={styles.gridHeaderItemSortable}
                    onClick={() => changeSorting(column.id)}
                  >
                    <span>{content.label}</span>
                    <span style={{ paddingLeft: 0 }}>
                      <EuiIcon
                        style={{ marginLeft: '4px' }}
                        type={sortedColumn?.order === SortOrder.DESC ? 'sortDown' : 'sortUp'}
                      />
                    </span>
                  </button>
                )}
                {!content?.sortable && (<div>{content.label}</div>)}
              </>
            )}
            {!isObject(content) && content}
            {!isObject(content) && !content && <div>&nbsp;</div> }
          </div>
        </div>
      )
    }
    if (columnIndex === 0) {
      const lastColumn = columns[columns.length - 1]
      const hasHorizontalScrollOffset = height < rowHeight * items.length

      return (
        <div
          className={cx(styles.gridItem,
            rowIndex % 2
              ? styles.gridItemOdd
              : styles.gridItemEven)}
          style={style}
        >
          {column?.render && isObject(rowData) && column?.render(rowData) }
          {!column?.render && content }

          <div
            className={cx(styles.gridItem, styles.gridItemLast,
              rowIndex % 2
                ? styles.gridItemOdd
                : styles.gridItemEven)}
            style={{
              width: lastColumn?.minWidth,
              height: rowHeight,
              marginLeft: width - lastColumn?.minWidth - (hasHorizontalScrollOffset ? 29 : 13)
            }}
          >
            {lastColumn?.render && isObject(rowData) && lastColumn?.render(rowData) }
          </div>
        </div>
      )
    }

    return (
      <div
        className={cx(styles.gridItem,
          rowIndex % 2
            ? styles.gridItemOdd
            : styles.gridItemEven)}
        style={style}
      >
        {column?.render && isObject(rowData) && column?.render(rowData) }
        {!column?.render && content }
      </div>
    )
  }

  const innerElementType = useInnerElementType(
    Cell,
    columnWidth,
    () => rowHeight,
    columns.length - 1,
  )

  return (
    <div
      className={styles.container}
      onWheel={onWheel}
      data-testid="virtual-grid-container"
    >
      {(loading && !hideProgress) && (
        <EuiProgress
          color="primary"
          size="xs"
          position="absolute"
          className={styles.progress}
          data-testid="progress-entry-list"
        />
      )}
      {items.length > 1 && (
        <AutoSizer onResize={onResize}>
          {() => (
            <InfiniteLoader
              isItemLoaded={(index) => index < items.length}
              loadMoreItems={loadMoreRows}
              minimumBatchSize={SCAN_COUNT_DEFAULT}
              threshold={100}
              itemCount={totalItemsCount}
            >
              {({ onItemsRendered, ref }) => (
                <Grid
                  ref={ref}
                  onItemsRendered={(props) =>
                    onItemsRendered({
                      visibleStartIndex: props.visibleRowStartIndex || 0,
                      visibleStopIndex: props.visibleRowStopIndex || 0,
                      overscanStartIndex: props.overscanRowStartIndex || 0,
                      overscanStopIndex: props.overscanRowStopIndex || 0,
                    })}
                  className={styles.grid}
                  columnCount={columns.length}
                  columnWidth={columnWidth}
                  height={height}
                  rowCount={items.length}
                  rowHeight={() => rowHeight}
                  width={width}
                  innerElementType={innerElementType}
                  onScroll={onScroll}
                  initialScrollTop={forceScrollTop}
                >
                  {Cell}
                </Grid>
              )}
            </InfiniteLoader>
          )}
        </AutoSizer>
      )}
      {items.length === 1 && (<EuiText className={styles.noItems} color="subdued">{loading ? loadingMsg : noItemsMessage}</EuiText>)}
    </div>
  )
}

export default VirtualGrid
