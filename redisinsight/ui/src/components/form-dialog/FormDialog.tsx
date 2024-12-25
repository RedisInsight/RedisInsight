import React from 'react'
import { EuiModal, EuiModalBody, EuiModalFooter, EuiModalHeader, EuiModalHeaderTitle } from '@elastic/eui'
import { Nullable } from 'uiSrc/utils'

import styles from './styles.module.scss'

export interface Props {
  isOpen: boolean
  onClose: () => void
  header: Nullable<React.ReactNode>
  footer?: Nullable<React.ReactNode>
  children: Nullable<React.ReactNode>
}

const FormDialog = (props: Props) => {
  const { isOpen, onClose, header, footer, children } = props

  if (!isOpen) return null

  return (
    <EuiModal
      className={styles.modal}
      onClose={onClose}
    >
      <EuiModalHeader>
        <EuiModalHeaderTitle id="formModalHeader">
          {header}
        </EuiModalHeaderTitle>
      </EuiModalHeader>
      <EuiModalBody>
        {children}
      </EuiModalBody>
      <EuiModalFooter>
        {footer}
      </EuiModalFooter>
    </EuiModal>
  )
}

export default FormDialog
