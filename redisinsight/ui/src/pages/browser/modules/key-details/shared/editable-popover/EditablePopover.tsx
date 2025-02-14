import React, {
  FormEvent,
  useEffect,
  useState,
} from 'react'

import {
  EuiButton,
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm, EuiLoadingSpinner,
  EuiPopover,
  EuiSpacer,
} from '@elastic/eui'

import cx from 'classnames'
import styles from './styles.module.scss'

export interface Props {
  content: React.ReactElement
  children: React.ReactElement
  className?: string
  editBtnClassName?: string
  isOpen?: boolean
  onOpen: () => void
  onApply: () => void
  onDecline?: () => void
  isLoading?: boolean
  isDisabled?: boolean
  declineOnUnmount?: boolean
  field?: string
  prefix?: string
  btnIconType?: string
  delay?: number
  isDisabledEditButton?: boolean
}

const EditablePopover = (props: Props) => {
  const {
    content,
    isOpen = false,
    onOpen,
    onDecline,
    onApply,
    children,
    isLoading,
    declineOnUnmount = true,
    isDisabled,
    field = '',
    prefix = '',
    btnIconType,
    className,
    editBtnClassName = '',
    isDisabledEditButton,
    delay
  } = props
  const [isHovering, setIsHovering] = useState(false)
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(isOpen)
  const [isDelayed, setIsDelayed] = useState(false)

  const delayPopover = () => {
    if (!delay) return

    setIsDelayed(() => {
      setTimeout(() => setIsDelayed(false), delay)
      return true
    })
  }

  useEffect(() =>
  // componentWillUnmount
    () => {
      declineOnUnmount && handleDecline()
    },
  [])

  useEffect(() => {
    if (isOpen) delayPopover()
    setIsPopoverOpen(isOpen)
  }, [isOpen])

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
    delayPopover()
    setIsPopoverOpen(true)
  }

  const isDisabledApply = (): boolean => !!(isLoading || isDisabled)

  const button = (
    <EuiButtonIcon
      disabled={isPopoverOpen}
      iconType={btnIconType || 'pencil'}
      aria-label="Edit field"
      color="primary"
      onClick={isDisabledEditButton ? () => {} : handleButtonClick}
      className={editBtnClassName}
      data-testid={`${prefix}_edit-btn-${field}`}
      isDisabled={isDisabledEditButton}
    />
  )

  return (
    <EuiPopover
      ownFocus
      anchorPosition="downLeft"
      isOpen={isPopoverOpen}
      anchorClassName={className}
      panelClassName={cx(styles.popoverWrapper, { [styles.isDelayed]: isDelayed })}
      closePopover={handleDecline}
      button={(
        <div
          className={styles.contentWrapper}
          onMouseEnter={() => setIsHovering(!isDisabledEditButton)}
          onMouseLeave={() => setIsHovering(false)}
          data-testid={`${prefix}_content-value-${field}`}
        >
          {content}
          {isDelayed && <EuiLoadingSpinner className={cx(editBtnClassName, styles.spinner)} size="m" />}
          {(!isPopoverOpen && isHovering && !isDelayed) && button}
        </div>
      )}
      data-testid="popover-item-editor"
      onClick={(e) => e.stopPropagation()}
    >
      <EuiForm component="form" onSubmit={onFormSubmit}>
        <div className={styles.content}>
          {children}
        </div>
        <EuiSpacer size="s" />
        <EuiFlexGroup className={styles.footer} responsive={false} justifyContent="flexEnd">
          <EuiFlexItem grow={false}>
            <EuiButton
              size="s"
              color="secondary"
              onClick={() => handleDecline()}
              data-testid="cancel-btn"
            >
              Cancel
            </EuiButton>
          </EuiFlexItem>

          <EuiFlexItem grow={false}>
            <EuiButton
              fill
              size="s"
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

export default EditablePopover
