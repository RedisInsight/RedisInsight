import {
  EuiButton,
  EuiFieldPassword,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiFormRow,
  EuiSpacer,
  EuiSplitPanel,
  EuiTitle
} from '@elastic/eui'
import { Formik } from 'formik'
import React from 'react'

import styles from './styles.module.scss'

interface ConnectionFormValues {
  name: string
  url: string
  username: string
  password: string
}

export interface Props {
  onAddInstance: () => void
  onCancel: () => void
}

const ConnectionForm = ({ onAddInstance, onCancel }: Props) => {
  const initialValues: ConnectionFormValues = {
    name: '',
    url: '',
    username: '',
    password: ''
  }

  const onSubmit = (formValues: ConnectionFormValues) => {
    console.log(formValues)
  }

  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit}>
      <EuiForm component="form">
        <EuiSplitPanel.Outer className={styles.connectionFormPanel} borderRadius="none">
          <EuiSplitPanel.Inner>
            <EuiTitle size="s">
              <h3>Connect to RDI</h3>
            </EuiTitle>
            <EuiSpacer />
            <EuiFormRow label="RDI Alias" fullWidth>
              <EuiFieldText name="name" fullWidth placeholder="Enter RDI Alias" />
            </EuiFormRow>
            <EuiFormRow label="URL*" fullWidth>
              <EuiFieldText name="url" fullWidth placeholder="Enter URL" />
            </EuiFormRow>
            <EuiFormRow label="Username*" fullWidth>
              <EuiFieldText name="username" fullWidth placeholder="Enter Username" />
            </EuiFormRow>
            <EuiFormRow label="Password*" fullWidth>
              <EuiFieldPassword
                name="password"
                className={styles.passwordField}
                fullWidth
                placeholder="Enter Password"
              />
            </EuiFormRow>
          </EuiSplitPanel.Inner>
          <EuiSplitPanel.Inner grow={false}>
            <EuiFlexGroup justifyContent="spaceBetween">
              <EuiFlexItem grow={false}>
                <EuiButton size="s" className={styles.testConnectionBtn}>
                  Test Connection
                </EuiButton>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiFlexGroup gutterSize="s">
                  <EuiFlexItem grow={false}>
                    <EuiButton size="s" onClick={onCancel}>
                      Cancel
                    </EuiButton>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <EuiButton size="s" fill color="secondary" onClick={onAddInstance}>
                      Add Instance
                    </EuiButton>
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiSplitPanel.Inner>
        </EuiSplitPanel.Outer>
      </EuiForm>
    </Formik>
  )
}

export default ConnectionForm
