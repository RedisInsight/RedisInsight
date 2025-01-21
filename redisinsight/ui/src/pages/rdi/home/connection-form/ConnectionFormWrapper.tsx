import React, { useState } from 'react'
import { EuiTitle } from '@elastic/eui'
import { FormDialog } from 'uiSrc/components'
import { Nullable } from 'uiSrc/utils'
import { ModalHeaderProvider } from 'uiSrc/contexts/ModalTitleProvider'
import ConnectionForm, { Props as ConnectionFormProps } from './ConnectionForm'

import styles from './styles.module.scss'

export interface Props extends ConnectionFormProps {
  isOpen: boolean
}

const ConnectionFormWrapper = (props: Props) => {
  const { isOpen, onCancel } = props
  const [modalHeader, setModalHeader] = useState<Nullable<React.ReactNode>>(null)

  return (
    <FormDialog
      isOpen={isOpen}
      onClose={onCancel}
      header={modalHeader ?? (<EuiTitle size="s"><h4>Add endpoint</h4></EuiTitle>)}
      footer={<div id="footerDatabaseForm" />}
    >
      <div className={styles.bodyWrapper}>
        <ModalHeaderProvider value={{ modalHeader, setModalHeader }}>
          <ConnectionForm {...props} />
        </ModalHeaderProvider>
      </div>
    </FormDialog>
  )
}

export default ConnectionFormWrapper
