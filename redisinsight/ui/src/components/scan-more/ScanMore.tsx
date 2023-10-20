import React from 'react'
import { isNull } from 'lodash'
import { EuiButton, EuiIcon, EuiToolTip } from '@elastic/eui'

import { SCAN_COUNT_DEFAULT } from 'uiSrc/constants/api'
import styles from './styles.module.scss'

export interface Props {
  withAlert?: boolean
  fill?: boolean
  loading: boolean
  scanned?: number
  totalItemsCount?: number
  nextCursor?: string
  style?: {
    [key: string]: string | number;
  }
  loadMoreItems?: (config: any) => void
}

const WARNING_MESSAGE = 'Scanning additional keys may decrease performance and memory available.'

const ScanMore = ({
  fill = true,
  withAlert = true,
  scanned = 0,
  totalItemsCount = 0,
  loading,
  style,
  loadMoreItems,
  nextCursor,
}: Props) => (
  <>
    {((scanned || isNull(totalItemsCount)))
      && nextCursor !== '0'
      && (
        <EuiButton
          fill={fill}
          size="s"
          color="secondary"
          style={style ?? { marginLeft: 25, height: 26 }}
          disabled={loading}
          className={styles.btn}
          onClick={() =>
            loadMoreItems?.({
              stopIndex: SCAN_COUNT_DEFAULT - 1,
              startIndex: 0,
            })}
          data-testid="scan-more"
        >
          {withAlert && (
            <EuiToolTip
              content={WARNING_MESSAGE}
              position="top"
              display="inlineBlock"
            >
              <EuiIcon type="iInCircle" />
            </EuiToolTip>
          )}
          Scan more
        </EuiButton>
      )}
  </>
)

export default ScanMore
