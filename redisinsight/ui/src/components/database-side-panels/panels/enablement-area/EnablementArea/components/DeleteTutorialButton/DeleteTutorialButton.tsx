import React, { useState } from 'react'
import { EuiButton, EuiIcon, EuiPopover, EuiText } from '@elastic/eui'

import { formatLongName } from 'uiSrc/utils'

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
      button={(
        <div
          className="group-header__btn group-header__delete-btn"
          role="presentation"
          onClick={handleClickDelete}
          data-testid={`delete-tutorial-icon-${id}`}
        >
          <EuiIcon size="m" type="trash" />
        </div>
        )}
      onClick={(e) => e.stopPropagation()}
      data-testid={`delete-tutorial-popover-${id}`}
    >
      <div className={styles.popoverDeleteContainer}>
        <EuiText size="m">
          <h4 style={{ wordBreak: 'break-all' }}>
            <b>{formatLongName(label)}</b>
          </h4>
          <EuiText size="s">
            will be deleted.
          </EuiText>
        </EuiText>
        <div className={styles.popoverFooter}>
          <EuiButton
            fill
            size="s"
            color="warning"
            iconType="trash"
            onClick={onDelete}
            isLoading={isLoading}
            data-testid={`delete-tutorial-${id}`}
          >
            Delete
          </EuiButton>
        </div>
      </div>
    </EuiPopover>
  )
}

export default DeleteTutorialButton
