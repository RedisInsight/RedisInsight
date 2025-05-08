import { EuiButton, EuiButtonIcon, EuiPopover, EuiText } from '@elastic/eui'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'

import {
  initialKeyInfo,
  keysSelector,
  selectedKeyDataSelector,
} from 'uiSrc/slices/browser/keys'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import {
  getBasedOnViewTypeEvent,
  sendEventTelemetry,
  TelemetryEvent,
} from 'uiSrc/telemetry'
import { formatLongName } from 'uiSrc/utils'

import styles from './styles.module.scss'

export interface Props {
  onDelete: (key: RedisResponseBuffer) => void
}

const KeyDetailsHeaderDelete = ({ onDelete }: Props) => {
  const {
    type,
    nameString: keyProp,
    name: keyBuffer,
  } = useSelector(selectedKeyDataSelector) ?? initialKeyInfo
  const { id: instanceId } = useSelector(connectedInstanceSelector)
  const { viewType } = useSelector(keysSelector)

  const [isPopoverDeleteOpen, setIsPopoverDeleteOpen] = useState(false)

  const tooltipContent = formatLongName(keyProp || '')

  const closePopoverDelete = () => {
    setIsPopoverDeleteOpen(false)
  }

  const showPopoverDelete = () => {
    setIsPopoverDeleteOpen((isPopoverDeleteOpen) => !isPopoverDeleteOpen)
    sendEventTelemetry({
      event: getBasedOnViewTypeEvent(
        viewType,
        TelemetryEvent.BROWSER_KEY_DELETE_CLICKED,
        TelemetryEvent.TREE_VIEW_KEY_DELETE_CLICKED,
      ),
      eventData: {
        databaseId: instanceId,
        source: 'keyValue',
        keyType: type,
      },
    })
  }

  return (
    <EuiPopover
      key={keyProp}
      anchorPosition="leftCenter"
      ownFocus
      isOpen={isPopoverDeleteOpen}
      closePopover={closePopoverDelete}
      panelPaddingSize="l"
      button={
        <EuiButtonIcon
          iconType="trash"
          color="primary"
          aria-label="Delete Key"
          className="deleteKeyBtn"
          onClick={showPopoverDelete}
          data-testid="delete-key-btn"
        />
      }
    >
      <div className={styles.popoverDeleteContainer}>
        <EuiText size="m">
          <h4 style={{ wordBreak: 'break-all' }}>
            <b>{tooltipContent}</b>
          </h4>
          <EuiText size="s">will be deleted.</EuiText>
        </EuiText>
        <div className={styles.popoverFooter}>
          <EuiButton
            fill
            size="s"
            color="warning"
            iconType="trash"
            onClick={() => onDelete(keyBuffer)}
            className={styles.popoverDeleteBtn}
            data-testid="delete-key-confirm-btn"
          >
            Delete
          </EuiButton>
        </div>
      </div>
    </EuiPopover>
  )
}

export { KeyDetailsHeaderDelete }
