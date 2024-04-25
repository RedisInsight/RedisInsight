import React, { useState } from 'react'
import { EuiButton, EuiFlexGroup, EuiFlexItem, EuiIcon, EuiPopover, EuiText } from '@elastic/eui'
import { Instance } from 'uiSrc/slices/interfaces'
import { formatLongName } from 'uiSrc/utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import styles from '../styles.module.scss'

export interface Props {
  selection: Instance[]
  onDelete: (instances: Instance[]) => void
}

const DeleteAction = (props: Props) => {
  const { selection, onDelete } = props
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const onButtonClick = () => {
    sendEventTelemetry({
      event: TelemetryEvent.CONFIG_DATABASES_MULTIPLE_DATABASES_DELETE_CLICKED,
      eventData: {
        databasesIds: selection.map((selected: Instance) => selected.id)
      }
    })
    setIsPopoverOpen((prevState) => !prevState)
  }

  const closePopover = () => {
    setIsPopoverOpen(false)
  }

  const deleteBtn = (
    <EuiButton
      onClick={onButtonClick}
      fill
      color="secondary"
      size="s"
      iconType="trash"
      className={styles.actionBtn}
      data-testid="delete-btn"
    >
      Delete
    </EuiButton>
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
        <p className={styles.popoverSubTitle}>
          Selected
          {' '}
          {selection.length}
          {' '}
          databases will be deleted from
          Redis Insight Databases:
        </p>
      </EuiText>
      <div
        className={styles.boxSection}
      >
        {selection.map((select: Instance) => (
          <EuiFlexGroup
            key={select.id}
            gutterSize="s"
            responsive={false}
            className={styles.nameList}
          >
            <EuiFlexItem grow={false}>
              <EuiIcon type="check" />
            </EuiFlexItem>
            <EuiFlexItem className={styles.nameListText}>
              <span>{formatLongName(select.name)}</span>
            </EuiFlexItem>
          </EuiFlexGroup>
        ))}
      </div>
      <div className={styles.popoverFooter}>
        <EuiButton
          fill
          size="s"
          color="warning"
          iconType="trash"
          onClick={() => {
            closePopover()
            onDelete(selection)
          }}
          className={styles.popoverDeleteBtn}
          data-testid="delete-selected-dbs"
        >
          Delete
        </EuiButton>
      </div>
    </EuiPopover>
  )
}

export default DeleteAction
