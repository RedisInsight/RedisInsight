import {
  EuiButton,
  EuiFieldPassword,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiFormRow,
  EuiIcon,
  EuiSpacer,
  EuiSplitPanel,
  EuiTitle,
  EuiToolTip
} from '@elastic/eui'
import { Field, FieldInputProps, Form, Formik, FormikErrors } from 'formik'
import React, { useEffect, useState } from 'react'

import { RdiInstance } from 'uiSrc/slices/interfaces'
import ValidationTooltip from './components/ValidationTooltip'

import styles from './styles.module.scss'

export interface ConnectionFormValues {
  name: string
  url: string
  username: string
  password: string
}

export interface Props {
  onAddInstance: (instance: Partial<RdiInstance>) => void
  onCancel: () => void
  editInstance: RdiInstance | null
  isLoading: boolean
}

const buildInitialValues = (values: RdiInstance | null): ConnectionFormValues => ({
  name: values?.name || '',
  url: values?.url || '',
  username: values?.username || '',
  password: values?.password || ''
})

const UrlTooltip = () => (
  <EuiToolTip
    data-testid="connection-form-url-tooltip"
    title={(
      <div>
        <p>
          <b>Pasting a connection URL auto fills the instance details.</b>
        </p>
        <p style={{ margin: 0, paddingTop: '10px' }}>The following connection URLs are supported:</p>
      </div>
    )}
    className={styles.urlTooltip}
    anchorClassName="inputAppendIcon"
    position="right"
    content={(
      <ul>
        <li>
          <span />
          TBD
        </li>
      </ul>
    )}
  >
    <EuiIcon data-testid="connection-form-url-icon" type="iInCircle" style={{ cursor: 'pointer' }} />
  </EuiToolTip>
)

const ConnectionForm = ({ onAddInstance, onCancel, editInstance, isLoading }: Props) => {
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
      errors.url = 'URL'
    }
    if (!values.username) {
      errors.username = 'Username'
    }
    if (!values.password) {
      errors.password = 'Password'
    }

    return errors
  }

  return (
    <Formik enableReinitialize initialValues={initialFormValues} validate={validate} onSubmit={onSubmit}>
      {({ isValid, errors }) => (
        <Form>
          <EuiForm component="div" data-testid="connection-form">
            <EuiSplitPanel.Outer className={styles.connectionFormPanel} borderRadius="none">
              <EuiSplitPanel.Inner>
                <EuiTitle size="s">
                  <h3>Connect to RDI</h3>
                </EuiTitle>
                <EuiSpacer />
                <EuiFormRow label="RDI Alias" fullWidth>
                  <Field name="name">
                    {({ field }: { field: FieldInputProps<string> }) => (
                      <EuiFieldText
                        data-testid="connection-form-name-input"
                        fullWidth
                        placeholder="Enter RDI Alias"
                        maxLength={500}
                        {...field}
                      />
                    )}
                  </Field>
                </EuiFormRow>
                <EuiFormRow label="URL*" fullWidth>
                  <Field name="url">
                    {({ field }: { field: FieldInputProps<string> }) => (
                      <EuiFieldText
                        data-testid="connection-form-url-input"
                        fullWidth
                        placeholder="Enter URL"
                        disabled={!!editInstance}
                        append={!editInstance ? <UrlTooltip /> : undefined}
                        {...field}
                      />
                    )}
                  </Field>
                </EuiFormRow>
                <EuiFormRow label="Username*" fullWidth>
                  <Field name="username">
                    {({ field }: { field: FieldInputProps<string> }) => (
                      <EuiFieldText
                        data-testid="connection-form-username-input"
                        fullWidth
                        placeholder="Enter Username"
                        maxLength={500}
                        {...field}
                      />
                    )}
                  </Field>
                </EuiFormRow>
                <EuiFormRow label="Password*" fullWidth>
                  <Field name="password">
                    {({ field }: { field: FieldInputProps<string> }) => (
                      <EuiFieldPassword
                        data-testid="connection-form-password-input"
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
                    <ValidationTooltip isValid={isValid} errors={errors}>
                      <EuiButton
                        size="s"
                        className={styles.testConnectionBtn}
                        iconType={!isValid ? 'iInCircle' : undefined}
                        isLoading={isLoading}
                        disabled={!isValid}
                      >
                        Test Connection
                      </EuiButton>
                    </ValidationTooltip>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <EuiFlexGroup gutterSize="s">
                      <EuiFlexItem grow={false}>
                        <EuiButton size="s" onClick={onCancel}>
                          Cancel
                        </EuiButton>
                      </EuiFlexItem>
                      <EuiFlexItem grow={false}>
                        <ValidationTooltip isValid={isValid} errors={errors}>
                          <EuiButton
                            type="submit"
                            size="s"
                            fill
                            color="secondary"
                            iconType={!isValid ? 'iInCircle' : undefined}
                            isLoading={isLoading}
                            disabled={!isValid}
                            data-testid="add-instance-btn"
                          >
                            Add Instance
                          </EuiButton>
                        </ValidationTooltip>
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
