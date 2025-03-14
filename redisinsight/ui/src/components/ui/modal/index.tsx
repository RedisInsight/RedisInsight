import React, { ComponentProps } from 'react'
import { Modal } from '@redislabsdev/redis-ui-components'
import classNames from 'classnames'

export type ModalProps = Omit<
  ComponentProps<typeof Modal>,
  'persistent' | 'open' | 'onOpenChange' | 'className' | 'content'
> & {
  isOpen?: boolean
  setIsOpen?: (isOpen: boolean) => void
  closable?: boolean
  className?: classNames.Argument
  classNameHeader?: classNames.Argument
  classNameBody?: classNames.Argument
}

const RIModal = ({
  isOpen,
  setIsOpen,
  closable,
  title,
  children,
  className,
  classNameBody,
  classNameHeader,
  ...rest
}: ModalProps) => {
  const cn = classNames('RI-modal', className)

  return (
    <Modal.Compose open={isOpen} onOpenChange={setIsOpen}>
      <Modal.Content.Compose persistent={!closable} className={cn} {...rest}>
        <Modal.Content.Header
          title={title}
          className={classNames('RI-modal-header', classNameHeader)}
        />
        <Modal.Content.Body
          content={children}
          className={classNames('RI-modal-body', classNameBody)}
        />
      </Modal.Content.Compose>
    </Modal.Compose>
  )
}

export { RIModal }
/*
<EuiModal className={styles.consentsPopup} onClose={() => {}} data-testid="consents-settings-popup">
        <EuiModalHeader className={styles.modalHeader}>
          <EuiFlexGroup justifyContent="spaceBetween">
            <EuiFlexItem grow={false}>
              <EuiTitle size="s">
                <h3 className={styles.consentsPopupTitle}>EULA and Privacy Settings</h3>
              </EuiTitle>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiIcon
                className={styles.redisIcon}
                size="original"
                type={Logo}
              />
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiModalHeader>
        <EuiModalBody className={styles.modalBody}>
          <ConsentsSettings onSubmitted={handleSubmitted} />
        </EuiModalBody>
      </EuiModal>
 */
