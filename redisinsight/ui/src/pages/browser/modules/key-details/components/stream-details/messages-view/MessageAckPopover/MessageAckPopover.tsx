import React from 'react'
import { EuiText, EuiPopover } from '@elastic/eui'

import {
  DestructiveButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import styles from './styles.module.scss'

export interface Props {
  id: string
  isOpen: boolean
  closePopover: () => void
  showPopover: () => void
  acknowledge: (entry: string) => void
}

const AckPopover = (props: Props) => {
  const {
    id,
    isOpen,
    closePopover = () => {},
    showPopover = () => {},
    acknowledge = () => {},
  } = props
  return (
    <EuiPopover
      key={id}
      anchorPosition="leftCenter"
      ownFocus
      isOpen={isOpen}
      closePopover={closePopover}
      panelPaddingSize="m"
      anchorClassName="ackMessagePopover"
      panelClassName={styles.popoverWrapper}
      button={
        <SecondaryButton
          size="s"
          aria-label="Acknowledge pending message"
          onClick={showPopover}
          className={styles.ackBtn}
          data-testid="acknowledge-btn"
        >
          ACK
        </SecondaryButton>
      }
    >
      <div className={styles.popover}>
        <EuiText size="m">
          <b>{id}</b>
          <br />
          will be acknowledged and removed from the pending messages list
        </EuiText>
        <div className={styles.popoverFooter}>
          <DestructiveButton
            size="s"
            onClick={() => acknowledge(id)}
            data-testid="acknowledge-submit"
          >
            Acknowledge
          </DestructiveButton>
        </div>
      </div>
    </EuiPopover>
  )
}

export default AckPopover
