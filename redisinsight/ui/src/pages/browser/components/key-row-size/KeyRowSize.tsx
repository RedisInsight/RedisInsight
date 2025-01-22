import React from 'react'
import cx from 'classnames'
import {
  EuiLoadingContent,
  EuiText,
  EuiToolTip,
} from '@elastic/eui'
import { isUndefined } from 'lodash'

import { Maybe, formatBytes } from 'uiSrc/utils'
import styles from './styles.module.scss'

export interface Props {
  size: Maybe<number>
  deletePopoverId: Maybe<number | string>
  rowId: number | string
  nameString: string
}

const KeyRowSize = (props: Props) => {
  const {
    size,
    nameString,
    deletePopoverId,
    rowId,
  } = props

  if (isUndefined(size)) {
    return (
      <EuiLoadingContent
        lines={1}
        className={cx(styles.keyInfoLoading, styles.keySize)}
        data-testid={`size-loading_${nameString}`}
      />
    )
  }

  if (!size) {
    return (
      <EuiText color="subdued" size="s" className={cx(styles.keySize)} data-testid={`size-${nameString}`}>
        -
      </EuiText>
    )
  }
  return (
    <>
      <EuiText
        color="subdued"
        size="s"
        className={cx(
          styles.keySize,
          'moveOnHoverKey',
          { hide: deletePopoverId === rowId },
        )}
        style={{ maxWidth: '100%' }}
      >
        <div style={{ display: 'flex' }} className="truncateText" data-testid={`size-${nameString}`}>
          <EuiToolTip
            title="Key Size"
            className={styles.tooltip}
            anchorClassName="truncateText"
            position="right"
            content={(
              <>
                {formatBytes(size, 3)}
              </>
            )}
          >
            <>{formatBytes(size, 0)}</>
          </EuiToolTip>
        </div>
      </EuiText>
    </>
  )
}

export default KeyRowSize
