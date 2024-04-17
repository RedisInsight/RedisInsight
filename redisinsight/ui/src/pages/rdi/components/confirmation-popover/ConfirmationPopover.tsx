import {
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
  onConfirm: () => void
  button: JSX.Element
  submitBtn: JSX.Element
  onButtonClick: () => void
  appendAction?: JSX.Element
}

const ConfirmationPopover = (props: Props) => {
  const {
    title,
    body,
    submitBtn,
    onConfirm,
    button,
    onButtonClick,
    appendAction,
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
  const confirmBtn = React.cloneElement(submitBtn, { onClick: handleConfirm })

  return (
    <EuiOutsideClickDetector onOutsideClick={handleClosePopover}>
      <EuiPopover
        id="confirmation-popover"
        initialFocus={false}
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
        <EuiFlexGroup gutterSize="none" justifyContent={appendAction ? 'spaceBetween' : 'flexEnd'} alignItems="center">
          <EuiFlexItem grow={false}>
            {!!appendAction && appendAction}
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            {confirmBtn}
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPopover>
    </EuiOutsideClickDetector>
  )
}

export default ConfirmationPopover
