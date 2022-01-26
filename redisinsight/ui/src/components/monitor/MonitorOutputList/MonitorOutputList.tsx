import React, { useEffect, useState } from 'react'
import { debounce } from 'lodash'
import cx from 'classnames'
import { EuiTextColor } from '@elastic/eui'
import { CellMeasurer, List, CellMeasurerCache, ListRowProps, OnScrollParams } from 'react-virtualized'

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

const cache = new CellMeasurerCache({
  defaultHeight: 17,
  fixedWidth: true,
  fixedHeight: false
})

const PROTRUDING_OFFSET = 2

const MonitorOutputList = (props: Props) => {
  const { compressed, items = [], width = 0, height = 0 } = props
  const [autoScroll, setAutoScroll] = useState(true)
  const [, forceRender] = useState({})

  const handleWheel = ({ clientHeight, scrollTop, scrollHeight }: OnScrollParams) => {
    setAutoScroll(clientHeight + scrollTop >= scrollHeight)
  }

  const updateWidth = debounce(() => {
    cache.clearAll()
    setTimeout(() => {
      forceRender({})
    }, 0)
  }, 50, { maxWait: 100 })

  useEffect(() => {
    // function "handleWheel" after the first render rewrite initial state value "true"
    setAutoScroll(true)

    globalThis.addEventListener('resize', updateWidth)
    return () => {
      globalThis.removeEventListener('resize', updateWidth)
    }
  }, [])

  useEffect(() => {
    updateWidth()
  }, [width, compressed])

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
        {({ registerChild }) => (
          <div className={styles.item} ref={registerChild} style={style}>
            {!isError && (
              <>
                <span>{getFormatTime(time)}</span>
                <span>{`[${database} ${source}]`}</span>
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
      width={width - PROTRUDING_OFFSET}
      height={height - PROTRUDING_OFFSET}
      rowCount={items.length}
      rowHeight={cache.rowHeight}
      rowRenderer={rowRenderer}
      overscanRowCount={30}
      className={styles.listWrapper}
      deferredMeasurementCache={cache}
      scrollToIndex={autoScroll ? items.length - 1 : undefined}
      onScroll={handleWheel}
    />
  )
}

export default MonitorOutputList
