import React from 'react'
import cx from 'classnames'
import { isNull } from 'lodash'
import { EuiText, EuiTextColor } from '@elastic/eui'
import { useSelector } from 'react-redux'

import { numberWithSpaces, nullableNumberWithSpaces } from 'uiSrc/utils/numbers'
import { KeyViewType } from 'uiSrc/slices/interfaces/keys'
import { keysSelector } from 'uiSrc/slices/browser/keys'
import { KeyTreeSettings } from 'uiSrc/pages/browser/components/key-tree'

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
  const notAccurateScanned = totalItemsCount
    && scanned >= totalItemsCount
    && nextCursor
    && nextCursor !== '0'
    ? '~' : ''

  const { viewType } = useSelector(keysSelector)

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
                    {'. '}
                  </b>
                  <EuiTextColor color="subdued">
                    {'Scanned '}
                    <span data-testid="keys-number-of-scanned">{notAccurateScanned}{numberWithSpaces(scannedDisplay)}</span>
                    {' / '}
                    <span data-testid="keys-total">{nullableNumberWithSpaces(totalItemsCount)}</span>
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
          {viewType === KeyViewType.Tree && (
            <KeyTreeSettings loading={loading} />
          )}
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
