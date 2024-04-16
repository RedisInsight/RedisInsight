import {
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiOutsideClickDetector,
  EuiPopover,
  EuiSpacer,
  EuiText
} from '@elastic/eui'
import React, { useState } from 'react'

import { formatLongName } from 'uiSrc/utils'

import styles from './styles.module.scss'

interface Props {
  title: string
  body: JSX.Element
  confirmButtonText: string
  onConfirm: () => void
  button: JSX.Element
  onButtonClick: () => void
  secondAction?: JSX.Element
}

const ConfirmationPopover = (props: Props) => {
  const {
    title,
    body,
    confirmButtonText,
    onConfirm,
    button,
    onButtonClick,
    secondAction,
  } = props
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false)

  const handleClosePopover = () => {
    setIsPopoverOpen(false)
  }

  const handleConfirm = () => {
    onConfirm()
    setIsPopoverOpen(false)
  }

  const handleButtonClick = () => {
    setIsPopoverOpen(true)
    onButtonClick()
  }

  const popoverButton = React.cloneElement(button, { onClick: handleButtonClick })

  return (
    <EuiOutsideClickDetector onOutsideClick={handleClosePopover}>
      <EuiPopover
        id="confirmation-popover"
        ownFocus
        anchorPosition="downCenter"
        isOpen={isPopoverOpen}
        closePopover={handleClosePopover}
        panelPaddingSize="m"
        display="inlineBlock"
        panelClassName={styles.panelPopover}
        button={popoverButton}
      >
        <EuiFlexGroup alignItems="center" gutterSize="none">
          <EuiFlexItem grow={false}>
            <EuiIcon type="alert" className={styles.alertIcon} />
          </EuiFlexItem>
          <EuiFlexItem grow={false} className="eui-textNoWrap">
            <EuiText>{formatLongName(title, 58, 0, '...')}</EuiText>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer size="xs" />
        {body}
        <EuiSpacer size="m" />
        <EuiFlexGroup gutterSize="none" justifyContent={secondAction ? 'spaceBetween' : 'flexEnd'} alignItems="center">
          <EuiFlexItem grow={false}>
            {!!secondAction && secondAction}
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton
              fill
              size="s"
              color="secondary"
              className={styles.popoverConfirmBtn}
              onClick={handleConfirm}
              data-testid="confirm-btn"
            >
              {confirmButtonText}
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPopover>
    </EuiOutsideClickDetector>
  )
}

export default ConfirmationPopover
