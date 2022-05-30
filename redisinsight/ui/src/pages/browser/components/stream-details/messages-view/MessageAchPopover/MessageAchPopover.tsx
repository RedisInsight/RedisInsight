import React from 'react'
import { EuiText, EuiPopover, EuiButton } from '@elastic/eui'

import styles from './styles.module.scss'

interface Props {
  id: string
  isOpen: boolean
  closePopover: () => void
  showPopover: () => void
  acknowledge: (entry: string) => void
}

const AckPopover = ({ id, isOpen, closePopover, showPopover, acknowledge }:Props) => (
  <EuiPopover
    key={id}
    anchorPosition="leftCenter"
    ownFocus
    isOpen={isOpen}
    closePopover={closePopover}
    panelPaddingSize="m"
    anchorClassName="deleteFieldPopover"
    button={(
      <EuiButton
        size="s"
        color="secondary"
        // aria-label={KEY_TYPES_ACTIONS[keyType].addItems?.name}
        onClick={showPopover}
        data-testid="add-key-valuexport default e-items-btn"
      >
        ACK
      </EuiButton>
    )}
  >
    <div className={styles.popover}>
      <EuiText size="m">
        <EuiText size="s">
          Are you sure to acknowledge
          <b>{id}</b>
          ?
        </EuiText>
        This will remove entry from pending list.
      </EuiText>
      <div className={styles.popoverFooter}>
        <EuiButton
          fill
          size="s"
          color="warning"
          iconType="trash"
          onClick={() => acknowledge(id)}
          data-testid="remove"
        >
          Acknowledge
        </EuiButton>
      </div>
    </div>
  </EuiPopover>
)

export default AckPopover
