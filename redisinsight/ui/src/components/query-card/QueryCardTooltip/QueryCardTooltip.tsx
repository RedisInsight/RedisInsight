import React from 'react'
import { EuiToolTip } from '@elastic/eui'
import { take } from 'lodash'
import cx from 'classnames'

import { Nullable, truncateText } from 'uiSrc/utils'
import { EMPTY_COMMAND } from 'uiSrc/constants'
import styles from './styles.module.scss'

export interface Props {
  query: Nullable<string>
  summary?: Nullable<string>
  maxLinesNumber?: number
}

interface IQueryLine {
  index: number
  value: string
  isFolding?: boolean
}

const QueryCardTooltip = (props: Props) => {
  const { query = '', maxLinesNumber = 20, summary = '' } = props

  let queryLines: IQueryLine[] = (query || EMPTY_COMMAND).split('\n')
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
      anchorClassName={styles.tooltipAnchor}
      content={<>{contentItems}</>}
      position="bottom"
    >
      <span data-testid="query-card-tooltip-anchor">{summary || query || EMPTY_COMMAND}</span>
    </EuiToolTip>
  )
}

export default QueryCardTooltip
