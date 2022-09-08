import React from 'react'
import { EuiToolTip } from '@elastic/eui'
import { take } from 'lodash'
import cx from 'classnames'

import { truncateText } from 'uiSrc/utils'
import styles from './styles.module.scss'

export interface Props {
  query: string
  summary?: string
  maxLinesNumber?: number
}

interface IQueryLine {
  index: number
  value: string
  isFolding?: boolean
}

const QueryCardTooltip = (props: Props) => {
  const { query = '', maxLinesNumber = 20, summary } = props

  let queryLines: IQueryLine[] = query
    .split('\n')
    .map((query: string, i) => ({
      value: truncateText(query, 497, '...'),
      index: i
    }))

  const isMultilineCommand = queryLines.length > 1
  if (queryLines.length > maxLinesNumber) {
    const lastItem = queryLines[queryLines.length - 1]
    queryLines = take(queryLines, maxLinesNumber - 2)
    queryLines.push({ index: queryLines.length, value: ' ...', isFolding: true })
    queryLines.push(lastItem)
  }

  const contentItems = queryLines
    .map((item: IQueryLine) => {
      const { value, index, isFolding } = item
      return !isMultilineCommand ? <span key={index}>{value}</span> : (
        <pre
          key={index}
          className={cx(styles.queryLine, styles.queryMultiLine, { [styles.queryLineFolding]: isFolding })}
        >
          <div className={styles.queryLineNumber}>{`${index + 1}`}</div>
          <span>{value}</span>
        </pre>
      )
    })

  return (
    <EuiToolTip
      className={styles.tooltip}
      content={<>{contentItems}</>}
      position="bottom"
    >
      <span>{summary || query}</span>
    </EuiToolTip>
  )
}

export default QueryCardTooltip
