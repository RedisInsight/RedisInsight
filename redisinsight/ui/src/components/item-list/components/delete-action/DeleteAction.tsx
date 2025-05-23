import React, { useState } from 'react'
import { EuiIcon, EuiPopover, EuiText } from '@elastic/eui'
import { formatLongName } from 'uiSrc/utils'

import {
  DestructiveButton,
  PrimaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { DeleteIcon } from 'uiSrc/components/base/icons'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import styles from '../styles.module.scss'

export interface Props<T> {
  selection: T[]
  onDelete: () => void
  subTitle: string
}

const DeleteAction = <T extends { id: string; name?: string }>(
  props: Props<T>,
) => {
  const { selection, onDelete, subTitle } = props
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const onButtonClick = () => {
    setIsPopoverOpen((prevState) => !prevState)
  }

  const closePopover = () => {
    setIsPopoverOpen(false)
  }

  const deleteBtn = (
    <PrimaryButton
      size="small"
      onClick={onButtonClick}
      icon={DeleteIcon}
      className={styles.actionBtn}
      data-testid="delete-btn"
    >
      Delete
    </PrimaryButton>
  )

  return (
    <EuiPopover
      id="deletePopover"
      ownFocus
      button={deleteBtn}
      isOpen={isPopoverOpen}
      closePopover={closePopover}
      panelPaddingSize="l"
      data-testid="delete-popover"
    >
      <EuiText size="m">
        <p className={styles.popoverSubTitle}>{subTitle}</p>
      </EuiText>
      <div className={styles.boxSection}>
        {selection.map((select) => (
          <Row key={select.id} gap="s" className={styles.nameList}>
            <FlexItem>
              <EuiIcon type="check" />
            </FlexItem>
            <FlexItem grow className={styles.nameListText}>
              <span>{formatLongName(select.name)}</span>
            </FlexItem>
          </Row>
        ))}
      </div>
      <div className={styles.popoverFooter}>
        <DestructiveButton
          icon={DeleteIcon}
          onClick={() => {
            closePopover()
            onDelete()
          }}
          className={styles.popoverDeleteBtn}
          data-testid="delete-selected-dbs"
        >
          Delete
        </DestructiveButton>
      </div>
    </EuiPopover>
  )
}

export default DeleteAction
