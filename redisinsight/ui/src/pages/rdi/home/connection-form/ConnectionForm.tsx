import {
  EuiButton,
  EuiFieldPassword,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiFormRow,
  EuiIcon,
  EuiTitle,
  EuiToolTip
} from '@elastic/eui'
import { Field, FieldInputProps, FieldMetaProps, Form, Formik, FormikErrors, FormikHelpers } from 'formik'
import React, { useEffect, useState } from 'react'
import cx from 'classnames'
import { isNull } from 'lodash'

import { SECURITY_FIELD } from 'uiSrc/constants'
import { RdiInstance } from 'uiSrc/slices/interfaces'
import { getFormUpdates, Nullable } from 'uiSrc/utils'
import ValidationTooltip from './components/ValidationTooltip'

import styles from './styles.module.scss'

export interface ConnectionFormValues {
  name: string
  url: string
  username: string
  password: Nullable<string>
}

export interface Props {
  onSubmit: (instance: Partial<RdiInstance>) => void
  onCancel: () => void
  editInstance: RdiInstance | null
  isLoading: boolean
}

const getInitialValues = (values: RdiInstance | null): ConnectionFormValues => ({
  name: values?.name || '',
  url: values?.url || '',
  username: values?.username || '',
  password: values ? null : ''
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

const ConnectionForm = (props: Props) => {
  const { onSubmit, onCancel, editInstance, isLoading } = props

  const [initialFormValues, setInitialFormValues] = useState(getInitialValues(editInstance))

  useEffect(() => {
    setInitialFormValues(getInitialValues(editInstance))
  }, [editInstance])

  const validate = (values: ConnectionFormValues) => {
    const errors: FormikErrors<ConnectionFormValues> = {}

    if (!values.name) {
      errors.name = 'RDI Alias'
    }
    if (!values.url) {
      errors.url = 'URL'
    }
    if (!values.username) {
      errors.username = 'Username'
    }
    // password is security field we did not received it from BE
    if (!values.password && !isNull(values.password)) {
      errors.password = 'Password'
    }

    return errors
  }

  const handleSubmit = (values: ConnectionFormValues) => {
    const updates = getFormUpdates(values, editInstance || {})
    onSubmit(updates)
  }

  return (
    <Formik
      enableReinitialize
      initialValues={initialFormValues}
      validateOnMount
      validate={validate}
      onSubmit={handleSubmit}
    >
      {({ isValid, errors }) => (
        <Form className={styles.form}>
          <EuiForm component="div" className="databasePanelWrapper" data-testid="connection-form">
            <div className={cx('container relative')}>
              <EuiTitle size="s">
                <h3>Connect to RDI</h3>
              </EuiTitle>
              <EuiFormRow label="RDI Alias*" fullWidth className={styles.withoutPadding}>
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
                  {({
                    field,
                    form,
                    meta
                  }: {
                    field: FieldInputProps<string>
                    form: FormikHelpers<string>
                    meta: FieldMetaProps<string>
                  }) => (
                    <EuiFieldPassword
                      data-testid="connection-form-password-input"
                      className={styles.passwordField}
                      fullWidth
                      placeholder="Enter Password"
                      maxLength={500}
                      {...field}
                      value={isNull(field.value) ? SECURITY_FIELD : field.value}
                      onFocus={() => {
                        if (isNull(field.value) && !meta.touched) {
                          form.setFieldValue('password', '')
                        }
                      }}
                    />
                  )}
                </Field>
              </EuiFormRow>
            </div>
            <div>
              <EuiFlexGroup className="footerAddDatabase" gutterSize="none" justifyContent="spaceBetween">
                <EuiFlexItem grow={false}>
                  {/* <ValidationTooltip isValid={isValid} errors={errors}> */}
                  {/*  <EuiButton */}
                  {/*    data-testid="connection-form-test-button" */}
                  {/*    className={styles.testConnectionBtn} */}
                  {/*    iconType={!isValid ? 'iInCircle' : undefined} */}
                  {/*    isLoading={isLoading} */}
                  {/*    disabled={!isValid} */}
                  {/*  > */}
                  {/*      Test Connection */}
                  {/*  </EuiButton> */}
                  {/* </ValidationTooltip> */}
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiFlexGroup gutterSize="s">
                    <EuiFlexItem grow={false}>
                      <EuiButton color="secondary" data-testid="connection-form-cancel-button" onClick={onCancel}>
                        Cancel
                      </EuiButton>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <ValidationTooltip isValid={isValid} errors={errors}>
                        <EuiButton
                          data-testid="connection-form-add-button"
                          type="submit"
                          fill
                          color="secondary"
                          iconType={!isValid ? 'iInCircle' : undefined}
                          isLoading={isLoading}
                          disabled={!isValid}
                        >
                          {editInstance ? 'Apply Changes' : 'Add Endpoint'}
                        </EuiButton>
                      </ValidationTooltip>
                    </EuiFlexItem>
                  </EuiFlexGroup>
                </EuiFlexItem>
              </EuiFlexGroup>
            </div>
          </EuiForm>
        </Form>
      )}
    </Formik>
  )
}

export default ConnectionForm
