import React, {
  FormEvent,
  useEffect,
  useState,
} from 'react'

import {
  EuiButton,
  EuiButtonIcon, EuiFlexGroup, EuiFlexItem, EuiForm,
  EuiPopover,
} from '@elastic/eui'
import styles from './styles.module.scss'

export interface Props {
  children: React.ReactElement
  className?: string
  onOpen: () => void
  onApply: () => void
  onDecline?: () => void
  isLoading?: boolean
  isDisabled?: boolean
  declineOnUnmount?: boolean
  btnTestId?: string
  btnIconType?: string
}

const PopoverItemEditor = (props: Props) => {
  const {
    onOpen,
    onDecline,
    onApply,
    children,
    isLoading,
    declineOnUnmount = true,
    isDisabled,
    btnTestId,
    btnIconType,
    className
  } = props
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false)

  useEffect(() =>
    // componentWillUnmount
    () => {
      declineOnUnmount && onDecline?.()
    },
  [])

  const onFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    handleApply()
  }

  const handleApply = (): void => {
    setIsPopoverOpen(false)
    onApply()
  }

  const handleDecline = () => {
    setIsPopoverOpen(false)
    onDecline?.()
  }

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation()
    onOpen?.()
    setIsPopoverOpen(true)
  }

  const isDisabledApply = (): boolean => !!(isLoading || isDisabled)

  const button = (
    <EuiButtonIcon
      iconType={btnIconType || 'pencil'}
      aria-label="Edit field"
      color="primary"
      disabled={isLoading}
      onClick={handleButtonClick}
      data-testid={btnTestId || 'popover-edit-bnt'}
    />
  )

  return (
    <EuiPopover
      ownFocus
      anchorPosition="downLeft"
      isOpen={isPopoverOpen}
      anchorClassName={className}
      panelClassName={styles.popoverWrapper}
      closePopover={handleDecline}
      button={button}
      data-testid="popover-item-editor"
      onClick={(e) => e.stopPropagation()}
    >
      <EuiForm component="form" onSubmit={onFormSubmit}>
        <div className={styles.content}>
          {children}
        </div>
        <EuiFlexGroup className={styles.footer} responsive={false} justifyContent="flexEnd">
          <EuiFlexItem grow={false}>
            <EuiButton color="secondary" onClick={() => handleDecline()} data-testid="cancel-btn">
              Cancel
            </EuiButton>
          </EuiFlexItem>

          <EuiFlexItem grow={false}>
            <EuiButton
              fill
              type="submit"
              color="secondary"
              isDisabled={isDisabledApply()}
              data-testid="save-btn"
            >
              Save
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiForm>
    </EuiPopover>
  )
}

export default PopoverItemEditor
