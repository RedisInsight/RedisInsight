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
import { Field, FieldInputProps, Form, Formik, FormikErrors } from 'formik'
import React, { useEffect, useState } from 'react'

import { RdiInstance } from 'uiSrc/slices/interfaces'

import styles from './styles.module.scss'

interface ConnectionFormValues {
  name: string
  url: string
  username: string
  password: string
}

export interface Props {
  onAddInstance: (instance: Partial<RdiInstance>) => void
  onCancel: () => void
  editInstance: RdiInstance | null
}

const buildInitialValues = (values: RdiInstance | null): ConnectionFormValues => ({
  name: values?.name || '',
  url: values?.url || '',
  username: values?.username || '',
  password: values?.password || ''
})

const ConnectionForm = ({ onAddInstance, onCancel, editInstance }: Props) => {
  const [initialFormValues, setInitialFormValues] = useState(buildInitialValues(editInstance))

  useEffect(() => {
    setInitialFormValues(buildInitialValues(editInstance))
  }, [editInstance])

  const onSubmit = (formValues: ConnectionFormValues) => {
    onAddInstance(formValues)
  }

  const validate = (values: ConnectionFormValues) => {
    const errors: FormikErrors<ConnectionFormValues> = {}

    if (!values.url) {
      errors.url = 'Required'
    } else if (!values.username) {
      errors.username = 'Required'
    } else if (!values.password) {
      errors.password = 'Required'
    }

    return errors
  }

  return (
    <Formik enableReinitialize initialValues={initialFormValues} validate={validate} onSubmit={onSubmit}>
      {({ isSubmitting, isValid }) => (
        <Form>
          <EuiForm component="div">
            <EuiSplitPanel.Outer className={styles.connectionFormPanel} borderRadius="none">
              <EuiSplitPanel.Inner>
                <EuiTitle size="s">
                  <h3>Connect to RDI</h3>
                </EuiTitle>
                <EuiSpacer />
                <EuiFormRow label="RDI Alias" fullWidth>
                  <Field name="name">
                    {({ field }: { field: FieldInputProps<string> }) => (
                      <EuiFieldText fullWidth placeholder="Enter RDI Alias" maxLength={500} {...field} />
                    )}
                  </Field>
                </EuiFormRow>
                <EuiFormRow label="URL*" fullWidth>
                  <Field name="url">
                    {({ field }: { field: FieldInputProps<string> }) => (
                      <EuiFieldText fullWidth placeholder="Enter URL" {...field} />
                    )}
                  </Field>
                </EuiFormRow>
                <EuiFormRow label="Username*" fullWidth>
                  <Field name="username">
                    {({ field }: { field: FieldInputProps<string> }) => (
                      <EuiFieldText fullWidth placeholder="Enter Username" maxLength={500} {...field} />
                    )}
                  </Field>
                </EuiFormRow>
                <EuiFormRow label="Password*" fullWidth>
                  <Field name="password">
                    {({ field }: { field: FieldInputProps<string> }) => (
                      <EuiFieldPassword
                        className={styles.passwordField}
                        fullWidth
                        placeholder="Enter Password"
                        maxLength={500}
                        {...field}
                      />
                    )}
                  </Field>
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
                        <EuiButton type="submit" size="s" fill color="secondary" disabled={!isValid || isSubmitting}>
                          Add Instance
                        </EuiButton>
                      </EuiFlexItem>
                    </EuiFlexGroup>
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiSplitPanel.Inner>
            </EuiSplitPanel.Outer>
          </EuiForm>
        </Form>
      )}
    </Formik>
  )
}

export default ConnectionForm
