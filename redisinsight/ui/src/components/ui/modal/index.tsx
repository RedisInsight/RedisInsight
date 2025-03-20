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
