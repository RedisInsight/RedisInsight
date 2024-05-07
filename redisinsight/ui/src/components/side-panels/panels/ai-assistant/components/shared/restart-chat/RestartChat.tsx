import React, { useState } from 'react'
import cx from 'classnames'
import { EuiButton, EuiPopover, EuiSpacer, EuiText, EuiTitle } from '@elastic/eui'

import styles from './styles.module.scss'

export interface Props {
  button: NonNullable<React.ReactElement>
  onConfirm: () => void
  anchorClassName?: string
}

const RestartChat = (props: Props) => {
  const { button, onConfirm, anchorClassName = '' } = props
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const handleConfirm = () => {
    setIsPopoverOpen(false)
    onConfirm()
  }

  const onClickAnchor = () => {
    setIsPopoverOpen(true)
  }

  const extendedButton = React.cloneElement(button, { onClick: onClickAnchor })

  return (
    <EuiPopover
      ownFocus
      initialFocus={false}
      className={styles.popoverAnchor}
      panelClassName={cx('euiToolTip', 'popoverLikeTooltip', styles.popover)}
      anchorClassName={cx(styles.popoverAnchor, anchorClassName)}
      anchorPosition="downLeft"
      isOpen={isPopoverOpen}
      panelPaddingSize="m"
      closePopover={() => setIsPopoverOpen(false)}
      focusTrapProps={{ scrollLock: true }}
      button={extendedButton}
    >
      <>
        <EuiTitle size="xxs"><h5>Restart session</h5></EuiTitle>
        <EuiSpacer size="s" />
        <EuiText size="xs">This will delete the current message history and initiate a new session.</EuiText>
        <EuiSpacer size="s" />
        <EuiButton
          fill
          size="s"
          color="secondary"
          onClick={handleConfirm}
          className={styles.confirmBtn}
          data-testid="ai-chat-restart-confirm"
        >
          Restart
        </EuiButton>
      </>
    </EuiPopover>
  )
}

export default React.memo(RestartChat)
