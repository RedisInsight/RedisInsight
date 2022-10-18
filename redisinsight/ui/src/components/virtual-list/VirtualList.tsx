import React, { useEffect, useRef } from 'react'
import { ListChildComponentProps, VariableSizeList as List } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'

import styles from './styles.module.scss'

export interface Props {
  items: (string | JSX.Element)[]
  overscanCount?: number
  minRowHeight?: number
}

const PROTRUDING_OFFSET = 2
const MIN_ROW_HEIGHT = 18
const OVERSCAN_COUNT = 20

const VirtualList = (props: Props) => {
  const {
    items = [],
    overscanCount = OVERSCAN_COUNT,
    minRowHeight = MIN_ROW_HEIGHT,
  } = props

  const listRef = useRef<List>(null)
  const rowHeights = useRef<{ [key: number]: number }>({})
  const outerRef = useRef<HTMLDivElement>(null)

  const getRowHeight = (index: number) => (
    rowHeights.current[index] > minRowHeight ? (rowHeights.current[index] + 2) : minRowHeight
  )

  const setRowHeight = (index: number, size: number) => {
    listRef.current?.resetAfterIndex(0)
    rowHeights.current = { ...rowHeights.current, [index]: size }
  }

  const Row = ({ index, style }: ListChildComponentProps) => {
    const rowRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      if (rowRef.current) {
        setRowHeight(index, rowRef.current?.clientHeight)
      }
    }, [rowRef])

    const rowContent = items[index]

    return (
      <div style={style} className={styles.item} data-testid={`row-${index}`}>
        <div className={styles.message} ref={rowRef}>{rowContent}</div>
      </div>
    )
  }

  return (
    <AutoSizer>
      {({ width, height }) => (
        <List
          itemCount={items.length}
          itemSize={getRowHeight}
          ref={listRef}
          className={styles.listContent}
          outerRef={outerRef}
          overscanCount={overscanCount}
          height={height}
          width={width - PROTRUDING_OFFSET}
        >
          {Row}
        </List>
      )}
    </AutoSizer>
  )
}

export default VirtualList
