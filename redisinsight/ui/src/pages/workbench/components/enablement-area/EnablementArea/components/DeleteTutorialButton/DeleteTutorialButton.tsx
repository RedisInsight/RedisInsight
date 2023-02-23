import React, { useState } from 'react'
import { EuiButton, EuiIcon, EuiPopover, EuiText } from '@elastic/eui'

import styles from './styles.module.scss'

export interface Props {
  id: string
  label: string | React.ReactElement
  onDelete: (e: React.MouseEvent) => void
}

const DeleteTutorialButton = (props: Props) => {
  const { id, label, onDelete } = props
  const [isPopoverDeleteOpen, setIsPopoverDeleteOpen] = useState<boolean>(false)

  const handleClickDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsPopoverDeleteOpen(true)
  }

  return (
    <EuiPopover
      anchorPosition="rightCenter"
      ownFocus
      isOpen={isPopoverDeleteOpen}
      closePopover={() => setIsPopoverDeleteOpen(false)}
      panelPaddingSize="l"
      button={(
        <div className="group-header__delete-btn" role="presentation" onClick={handleClickDelete}>
          <EuiIcon size="m" type="trash" />
        </div>
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <div className={styles.popoverDeleteContainer}>
        <EuiText size="m">
          <h4 style={{ wordBreak: 'break-all' }}>
            <b>{label}</b>
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
