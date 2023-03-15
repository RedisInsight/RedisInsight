import React from 'react'
import cx from 'classnames'
import { isNull } from 'lodash'
import { EuiText, EuiTextColor } from '@elastic/eui'

import { numberWithSpaces, nullableNumberWithSpaces } from 'uiSrc/utils/numbers'
import ScanMore from '../scan-more'

import styles from './styles.module.scss'

export interface Props {
  loading: boolean
  items: any[]
  showScanMore?: boolean
  scanned?: number
  totalItemsCount?: number
  nextCursor?: string
  scanMoreStyle?: {
    [key: string]: string | number;
  }
  loadMoreItems?: (config: any) => void
}

const KeysSummary = (props: Props) => {
  const {
    items = [],
    loading,
    showScanMore = true,
    scanned = 0,
    totalItemsCount = 0,
    scanMoreStyle,
    loadMoreItems,
    nextCursor,
  } = props

  const resultsLength = items.length
  const scannedDisplay = resultsLength > scanned ? resultsLength : scanned

  return (
    <>
      {(!!totalItemsCount || isNull(totalItemsCount)) && (
        <div className={styles.content} data-testid="keys-summary">
          <EuiText size="xs">
            {!!scanned && (
              <>
                <EuiTextColor className="eui-alignMiddle">
                  <b>
                    {'Results: '}
                    <span data-testid="keys-number-of-results">{numberWithSpaces(resultsLength)}</span>
                    {` key${resultsLength !== 1 ? 's' : ''}. `}
                  </b>
                  <EuiTextColor color="subdued">
                    {'Scanned '}
                    <span data-testid="keys-number-of-scanned">{numberWithSpaces(scannedDisplay)}</span>
                    {' / '}
                    <span data-testid="keys-total">{nullableNumberWithSpaces(totalItemsCount)}</span>
                    {' keys'}
                    <span
                      className={cx([styles.loading, { [styles.loadingShow]: loading }])}
                    />
                  </EuiTextColor>
                </EuiTextColor>
                {showScanMore && (
                  <ScanMore
                    withAlert
                    fill={false}
                    style={scanMoreStyle}
                    scanned={scanned}
                    totalItemsCount={totalItemsCount}
                    loading={loading}
                    loadMoreItems={loadMoreItems}
                    nextCursor={nextCursor}
                  />
                )}
              </>
            )}

            {!scanned && (
              <EuiText size="xs">
                <b>
                  {'Total: '}
                  {nullableNumberWithSpaces(totalItemsCount)}
                </b>
              </EuiText>
            )}
          </EuiText>
        </div>
      )}
      {loading && !totalItemsCount && !isNull(totalItemsCount) && (
        <EuiText size="xs" data-testid="scanning-text">
          Scanning...
        </EuiText>
      )}
    </>
  )
}

export default KeysSummary
