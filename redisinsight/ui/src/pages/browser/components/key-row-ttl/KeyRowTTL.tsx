import React from 'react'
import cx from 'classnames'
import {
  EuiLoadingContent,
  EuiText,
  EuiTextColor,
  EuiToolTip,
} from '@elastic/eui'
import { isUndefined } from 'lodash'

import {
  Maybe,
  truncateNumberToDuration,
  truncateNumberToFirstUnit,
  truncateTTLToSeconds,
} from 'uiSrc/utils'
import styles from './styles.module.scss'

export interface Props {
  ttl: Maybe<number>
  deletePopoverId: Maybe<number | string>
  rowId: number | string
  nameString: string
}

const KeyRowTTL = (props: Props) => {
  const { ttl, nameString, deletePopoverId, rowId } = props

  if (isUndefined(ttl)) {
    return (
      <EuiLoadingContent
        lines={1}
        className={cx(styles.keyInfoLoading, styles.keyTTL)}
        data-testid={`ttl-loading_${nameString}`}
      />
    )
  }
  if (ttl === -1) {
    return (
      <EuiTextColor
        className={cx(
          styles.keyTTL,
          'moveOnHoverKey',
          { hide: deletePopoverId === rowId },
        )}
        color="subdued"
        data-testid={`ttl-${nameString}`}
      >
        No limit
      </EuiTextColor>
    )
  }
  return (
    <EuiText
      className={cx(
        styles.keyTTL,
        'moveOnHoverKey',
        { hide: deletePopoverId === rowId },
      )}
      color="subdued"
      size="s"
    >
      <div style={{ display: 'flex' }} className="truncateText" data-testid={`ttl-${nameString}`}>
        <EuiToolTip
          title="Time to Live"
          className={styles.tooltip}
          anchorClassName="truncateText"
          position="right"
          content={(
            <>
              {`${truncateTTLToSeconds(ttl)} s`}
              <br />
              {`(${truncateNumberToDuration(ttl)})`}
            </>
          )}
        >
          <>{truncateNumberToFirstUnit(ttl)}</>
        </EuiToolTip>
      </div>
    </EuiText>
  )
}

export default KeyRowTTL
