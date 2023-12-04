import React from 'react'
import { EuiText, EuiPopover, EuiButton } from '@elastic/eui'

import styles from './styles.module.scss'

export interface Props {
  id: string
  isOpen: boolean
  closePopover: () => void
  showPopover: () => void
  acknowledge: (entry: string) => void
}

const AckPopover = (props: Props) => {
  const { id, isOpen, closePopover = () => {}, showPopover = () => {}, acknowledge = () => {} } = props
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
      button={(
        <EuiButton
          size="s"
          color="secondary"
          aria-label="Acknowledge pending message"
          onClick={showPopover}
          className={styles.ackBtn}
          data-testid="acknowledge-btn"
        >
          ACK
        </EuiButton>
      )}
    >
      <div className={styles.popover}>
        <EuiText size="m">
          <b>{id}</b>
          <br />
          will be acknowledged and removed from the pending messages list
        </EuiText>
        <div className={styles.popoverFooter}>
          <EuiButton
            fill
            size="s"
            color="warning"
            onClick={() => acknowledge(id)}
            data-testid="acknowledge-submit"
          >
            Acknowledge
          </EuiButton>
        </div>
      </div>
    </EuiPopover>
  )
}

export default AckPopover
