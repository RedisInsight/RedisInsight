import React, { useState } from 'react'
import { EuiIcon, EuiPopover, EuiText } from '@elastic/eui'

import { formatLongName } from 'uiSrc/utils'

import { DestructiveButton } from 'uiSrc/components/base/forms/buttons'
import { DeleteIcon } from 'uiSrc/components/base/icons'
import styles from './styles.module.scss'

export interface Props {
  id: string
  label: string
  isLoading?: boolean
  onDelete: (e: React.MouseEvent) => void
}

const DeleteTutorialButton = (props: Props) => {
  const { id, label, onDelete, isLoading } = props
  const [isPopoverDeleteOpen, setIsPopoverDeleteOpen] = useState<boolean>(false)

  const handleClickDelete = () => {
    setIsPopoverDeleteOpen((v) => !v)
  }

  return (
    <EuiPopover
      anchorPosition="rightCenter"
      ownFocus
      isOpen={isPopoverDeleteOpen}
      closePopover={() => setIsPopoverDeleteOpen(false)}
      panelPaddingSize="l"
      button={
        <div
          className="group-header__btn group-header__delete-btn"
          role="presentation"
          onClick={handleClickDelete}
          data-testid={`delete-tutorial-icon-${id}`}
        >
          <EuiIcon size="m" type="trash" />
        </div>
      }
      onClick={(e) => e.stopPropagation()}
      data-testid={`delete-tutorial-popover-${id}`}
    >
      <div className={styles.popoverDeleteContainer}>
        <EuiText size="m">
          <h4 style={{ wordBreak: 'break-all' }}>
            <b>{formatLongName(label)}</b>
          </h4>
          <EuiText size="s">will be deleted.</EuiText>
        </EuiText>
        <div className={styles.popoverFooter}>
          <DestructiveButton
            size="s"
            icon={DeleteIcon}
            onClick={onDelete}
            loading={isLoading}
            data-testid={`delete-tutorial-${id}`}
          >
            Delete
          </DestructiveButton>
        </div>
      </div>
    </EuiPopover>
  )
}

export default DeleteTutorialButton
