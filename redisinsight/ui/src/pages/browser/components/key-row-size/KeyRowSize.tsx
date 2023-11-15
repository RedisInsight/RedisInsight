import React from 'react'
import cx from 'classnames'
import {
  EuiButton,
  EuiButtonIcon,
  EuiLoadingContent,
  EuiPopover,
  EuiSpacer,
  EuiText,
  EuiToolTip,
} from '@elastic/eui'
import { isUndefined } from 'lodash'

import { Maybe, formatBytes, formatLongName } from 'uiSrc/utils'
import { KeyTypes, ModulesKeyTypes } from 'uiSrc/constants'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import styles from './styles.module.scss'

export interface Props {
  size: Maybe<number>
  deletePopoverId: Maybe<number | string>
  rowId: number | string
  nameString: string
  type: KeyTypes | ModulesKeyTypes
  deleting: boolean
  nameBuffer: RedisResponseBuffer
  setDeletePopoverId: (id: any) => void
  handleDeletePopoverOpen: (id: any, type: KeyTypes | ModulesKeyTypes) => void
  handleDelete: (key: RedisResponseBuffer) => void
}

const KeyRowSize = (props: Props) => {
  const {
    size,
    nameString,
    nameBuffer,
    deletePopoverId,
    deleting,
    rowId,
    type,
    setDeletePopoverId,
    handleDeletePopoverOpen,
    handleDelete,
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
      <EuiPopover
        anchorClassName={cx(
          styles.deleteAnchor,
          'showOnHoverKey',
          { show: deletePopoverId === rowId },
        )}
        anchorPosition="rightUp"
        isOpen={deletePopoverId === rowId}
        closePopover={() => setDeletePopoverId(undefined)}
        panelPaddingSize="l"
        panelClassName={styles.deletePopover}
        button={(
          <EuiButtonIcon
            iconType="trash"
            onClick={() => handleDeletePopoverOpen(rowId, type)}
            aria-label="Delete Key"
            data-testid={`delete-key-btn-${nameString}`}
          />
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <>
          <EuiText size="m">
            <h4 style={{ wordBreak: 'break-all' }}><b>{formatLongName(nameString)}</b></h4>
            <EuiText size="s">will be deleted.</EuiText>
          </EuiText>
          <EuiSpacer size="m" />
          <EuiButton
            fill
            size="s"
            color="warning"
            iconType="trash"
            isDisabled={deleting}
            onClick={() => handleDelete(nameBuffer)}
            data-testid="submit-delete-key"
          >
            Delete
          </EuiButton>
        </>
      </EuiPopover>
    </>
  )
}

export default KeyRowSize
