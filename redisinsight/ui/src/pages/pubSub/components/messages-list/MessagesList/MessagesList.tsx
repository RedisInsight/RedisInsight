import React, { useEffect, useRef } from 'react'
import { CellMeasurer, CellMeasurerCache, List, ListRowProps } from 'react-virtualized'
import AutoSizer from 'react-virtualized-auto-sizer'

import { getFormatDateTime } from 'uiSrc/utils'
import { IMessage } from 'apiSrc/modules/pub-sub/interfaces/message.interface'
import styles from './styles.module.scss'

export interface Props {
  items: IMessage[]
}

const PROTRUDING_OFFSET = 2

const MessagesList = (props: Props) => {
  const { items = [] } = props

  const cache = new CellMeasurerCache({
    defaultHeight: 17,
    fixedWidth: true,
    fixedHeight: false
  })

  const listRef = useRef<List>(null)

  useEffect(() => {
    clearCacheAndUpdate()
  }, [items])

  const clearCacheAndUpdate = () => {
    listRef?.current?.scrollToRow(items.length - 1)
    requestAnimationFrame(() => {
      listRef?.current?.scrollToRow(items.length - 1)
    })
  }

  const rowRenderer = ({ parent, index, key, style }: ListRowProps) => {
    const { time = 0, channel = '', message = '' } = items[index]
    return (
      <CellMeasurer
        cache={cache}
        columnIndex={0}
        key={key}
        parent={parent}
        rowIndex={index}
      >
        {({ registerChild, measure }) => (
          <div onLoad={measure} className={styles.item} ref={registerChild} style={style}>
            <div className={styles.time}>{getFormatDateTime(time)}</div>
            <div className={styles.channel}>{channel}</div>
            <div className={styles.message}>{message}</div>
          </div>
        )}
      </CellMeasurer>
    )
  }

  return (
    <>
      <div className={styles.header} data-testid="messages-list">
        <div className={styles.time}>Timestamp</div>
        <div className={styles.channel}>Channel</div>
        <div className={styles.message}>Message</div>
      </div>
      <AutoSizer>
        {({ width, height }) => (
          <List
            ref={listRef}
            width={width - PROTRUDING_OFFSET}
            height={height - PROTRUDING_OFFSET}
            rowCount={items.length}
            rowHeight={cache.rowHeight}
            rowRenderer={rowRenderer}
            overscanRowCount={30}
            className={styles.listWrapper}
            deferredMeasurementCache={cache}
          />
        )}
      </AutoSizer>
    </>
  )
}

export default MessagesList
