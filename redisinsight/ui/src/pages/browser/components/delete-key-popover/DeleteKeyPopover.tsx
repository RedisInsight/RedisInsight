import { EuiButton, EuiButtonIcon, EuiPopover, EuiText } from '@elastic/eui'

import React from 'react'

import cx from 'classnames'
import { KeyTypes, ModulesKeyTypes } from 'uiSrc/constants'
import { formatLongName } from 'uiSrc/utils'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { Spacer } from 'uiSrc/components/base/layout/spacer'

export interface DeleteProps {
  nameString: string
  name: RedisResponseBuffer
  type: KeyTypes | ModulesKeyTypes
  rowId: number
  deletePopoverId?: number
  deleting?: boolean
  onDelete: (key: RedisResponseBuffer) => void
  onOpenPopover: (index: number, type: KeyTypes | ModulesKeyTypes) => void
}

export const DeleteKeyPopover = ({
  nameString,
  name,
  type,
  rowId,
  deletePopoverId,
  deleting,
  onDelete,
  onOpenPopover,
}: DeleteProps) => (
  <EuiPopover
    anchorClassName={cx('showOnHoverKey', { show: deletePopoverId === rowId })}
    anchorPosition="leftUp"
    isOpen={deletePopoverId === rowId}
    closePopover={() => onOpenPopover(-1, type)}
    panelPaddingSize="l"
    button={
      <EuiButtonIcon
        iconType="trash"
        onClick={() => onOpenPopover(rowId, type)}
        aria-label="Delete Key"
        data-testid={`delete-key-btn-${nameString}`}
      />
    }
    onClick={(e) => e.stopPropagation()}
  >
    <>
      <EuiText size="m">
        <h4 style={{ wordBreak: 'break-all' }}>
          <b>{formatLongName(nameString)}</b>
        </h4>
        <EuiText size="s">will be deleted.</EuiText>
      </EuiText>
      <Spacer size="m" />
      <EuiButton
        fill
        size="s"
        color="warning"
        iconType="trash"
        isDisabled={deleting}
        onClick={() => onDelete(name)}
        data-testid="submit-delete-key"
      >
        Delete
      </EuiButton>
    </>
  </EuiPopover>
)
