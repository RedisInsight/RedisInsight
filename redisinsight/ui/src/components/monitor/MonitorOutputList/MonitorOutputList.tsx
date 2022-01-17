import React from 'react'
import cx from 'classnames'
import { List, AutoSizer } from 'react-virtualized'

import { EuiFlexGroup, EuiFlexItem, EuiTextColor } from '@elastic/eui'
import { getFormatTime } from 'uiSrc/utils'
import { DEFAULT_TEXT } from 'uiSrc/components/notifications'

import styles from 'uiSrc/components/monitor/Monitor/styles.module.scss'
import 'react-virtualized/styles.css'

const MonitorOutputList = ({ compressed, items }: { compressed: boolean, items: any[] }) => {
  const getArgs = (args: string[]): JSX.Element => (
    <div className={cx(styles.itemArgs, { [styles.itemArgs__compressed]: compressed })}>
      {args?.map((arg, i) => (
        <span key={`${arg + i}`}>
          {i === 0 && (
            <span className={cx(styles.itemCommandFirst)}>{`"${arg}"`}</span>
          )}
          { i !== 0 && ` "${arg}"`}
        </span>
      ))}
    </div>
  )

  const rowRenderer = ({ index, key, style }) => {
    const { time = '', args = [], database = '', source = '', isError, message = '' } = items[index]
    return (
      <div className={styles.item} key={key} style={style}>
        {!isError && (
          <EuiFlexGroup responsive={false}>
            <EuiFlexItem grow={false} className={styles.itemTime}>
              {getFormatTime(time)}
            </EuiFlexItem>
            <EuiFlexItem grow={false} className={styles.itemSource} style={{ paddingRight: 10 }}>
              {`[${database} ${source}]`}
            </EuiFlexItem>
            <EuiFlexItem>
              {getArgs(args)}
            </EuiFlexItem>
          </EuiFlexGroup>
        )}
        {isError && (
          <EuiFlexGroup>
            <EuiFlexItem>
              <EuiTextColor color="danger">{message ?? DEFAULT_TEXT}</EuiTextColor>
            </EuiFlexItem>
          </EuiFlexGroup>
        )}
      </div>
    )
  }

  console.log(items.length)

  return (
    <AutoSizer>
      {({ width, height }) => (
        <List
          width={width}
          height={height}
          rowCount={items.length}
          rowHeight={17}
          rowRenderer={rowRenderer}
          overscanRowCount={30}
          className={styles.listWrapper}
          scrollToIndex={items.length - 1}
        />
      )}
    </AutoSizer>
  )
}

export default MonitorOutputList
