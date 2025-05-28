import React, { useState } from 'react'
import cx from 'classnames'
import { EuiPopover, EuiText } from '@elastic/eui'

import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import { Title } from 'uiSrc/components/base/text/Title'
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
        <Title size="S">Restart session</Title>
        <Spacer size="s" />
        <EuiText size="xs">
          This will delete the current message history and initiate a new
          session.
        </EuiText>
        <Spacer size="s" />
        <PrimaryButton
          size="s"
          onClick={handleConfirm}
          className={styles.confirmBtn}
          data-testid="ai-chat-restart-confirm"
        >
          Restart
        </PrimaryButton>
      </>
    </EuiPopover>
  )
}

export default React.memo(RestartChat)
