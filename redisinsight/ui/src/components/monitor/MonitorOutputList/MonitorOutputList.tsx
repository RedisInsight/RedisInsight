import React, { useEffect, useRef } from 'react'
import cx from 'classnames'
import { EuiTextColor } from '@elastic/eui'
import { CellMeasurer, List, CellMeasurerCache, ListRowProps } from 'react-virtualized'

import { getFormatTime } from 'uiSrc/utils'
import { DEFAULT_TEXT } from 'uiSrc/components/notifications'

import styles from 'uiSrc/components/monitor/Monitor/styles.module.scss'
import 'react-virtualized/styles.css'

export interface Props {
  compressed: boolean
  items: any[]
  width: number
  height: number
}

const PROTRUDING_OFFSET = 2

const MonitorOutputList = (props: Props) => {
  const { compressed, items = [], width = 0, height = 0 } = props

  const cache = new CellMeasurerCache({
    defaultHeight: 17,
    fixedWidth: true,
    fixedHeight: false
  })

  const listRef = useRef<List>(null)

  const clearCacheAndUpdate = () => {
    listRef?.current?.scrollToRow(items.length - 1)
    requestAnimationFrame(() => {
      listRef?.current?.scrollToRow(items.length - 1)
    })
  }

  useEffect(() => {
    clearCacheAndUpdate()
  }, [items])

  const getArgs = (args: string[]): JSX.Element => (
    <span className={cx(styles.itemArgs, { [styles.itemArgs__compressed]: compressed })}>
      {args?.map((arg, i) => (
        <span key={`${arg + i}`}>
          {i === 0 && (
            <span className={cx(styles.itemCommandFirst)}>{`"${arg}"`}</span>
          )}
          { i !== 0 && ` "${arg}"`}
        </span>
      ))}
    </span>
  )

  const rowRenderer = ({ parent, index, key, style }: ListRowProps) => {
    const { time = '', args = [], database = '', source = '', isError, message = '' } = items[index]
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
            {!isError && (
              <>
                {width > 460 && (<span>{getFormatTime(time)}</span>)}
                {width > 360 && (<span>{`[${database} ${source}]`}</span>)}
                <span>{getArgs(args)}</span>
              </>
            )}
            {isError && (
              <EuiTextColor color="danger">{message ?? DEFAULT_TEXT}</EuiTextColor>
            )}
          </div>
        )}
      </CellMeasurer>
    )
  }

  return (
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
  )
}

export default MonitorOutputList
