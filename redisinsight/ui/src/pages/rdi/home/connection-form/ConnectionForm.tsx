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
  EuiToolTip,
  EuiToolTipProps,
  ToolTipPositions,
} from '@elastic/eui'
import { Field, FieldInputProps, FieldMetaProps, Form, Formik, FormikErrors, FormikHelpers } from 'formik'
import React, { useEffect, useState } from 'react'
import cx from 'classnames'
import { isNull } from 'lodash'

import ReactDOM from 'react-dom'
import { SECURITY_FIELD } from 'uiSrc/constants'
import { RdiInstance } from 'uiSrc/slices/interfaces'
import { getFormUpdates, Nullable } from 'uiSrc/utils'
import { useModalHeader } from 'uiSrc/contexts/ModalTitleProvider'
import ValidationTooltip from './components/ValidationTooltip'

import styles from './styles.module.scss'

export interface AppendInfoProps extends Omit<EuiToolTipProps, 'children' | 'delay' | 'position'> {
  position?: ToolTipPositions
}

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
  username: values ? (values.username ?? '') : 'default',
  password: values ? null : ''
})

const AppendInfo = ({ title, content, ...rest }: AppendInfoProps) => (
  <EuiToolTip
    anchorClassName="inputAppendIcon"
    position="right"
    title={title}
    content={content}
    {...rest}
  >
    <EuiIcon type="iInCircle" style={{ cursor: 'pointer' }} />
  </EuiToolTip>
)

const ConnectionForm = (props: Props) => {
  const { onSubmit, onCancel, editInstance, isLoading } = props

  const [initialFormValues, setInitialFormValues] = useState(getInitialValues(editInstance))
  const { setModalHeader } = useModalHeader()

  useEffect(() => {
    setInitialFormValues(getInitialValues(editInstance))
    setModalHeader(<EuiTitle size="s"><h4>{editInstance ? 'Edit endpoint' : 'Add RDI endpoint'}</h4></EuiTitle>)
  }, [editInstance])

  const validate = (values: ConnectionFormValues) => {
    const errors: FormikErrors<ConnectionFormValues> = {}

    if (!values.name) {
      errors.name = 'RDI Alias'
    }
    if (!values.url) {
      errors.url = 'URL'
    }

    return errors
  }

  const handleSubmit = (values: ConnectionFormValues) => {
    const updates = getFormUpdates(values, editInstance || {})
    onSubmit(updates)
  }

  const Footer = ({ isValid, errors, onSubmit }: {
    isValid: boolean,
    errors: FormikErrors<ConnectionFormValues>
    onSubmit: () => void
  }) => {
    const footerEl = document.getElementById('footerDatabaseForm')

    if (!footerEl) return null

    return ReactDOM.createPortal(
      (
        <EuiFlexGroup className="footerAddDatabase" gutterSize="none" justifyContent="spaceBetween">
          <EuiFlexItem grow={false} />
          <EuiFlexItem grow={false}>
            <EuiFlexGroup gutterSize="m">
              <EuiFlexItem grow={false}>
                <EuiButton
                  size="s"
                  color="secondary"
                  data-testid="connection-form-cancel-button"
                  onClick={onCancel}
                >
                  Cancel
                </EuiButton>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <ValidationTooltip isValid={isValid} errors={errors}>
                  <EuiButton
                    data-testid="connection-form-add-button"
                    type="submit"
                    fill
                    size="s"
                    color="secondary"
                    iconType={!isValid ? 'iInCircle' : undefined}
                    isLoading={isLoading}
                    disabled={!isValid}
                    onClick={onSubmit}
                  >
                    {editInstance ? 'Apply Changes' : 'Add Endpoint'}
                  </EuiButton>
                </ValidationTooltip>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
        </EuiFlexGroup>
      ),
      footerEl
    )
  }

  return (
    <Formik
      enableReinitialize
      initialValues={initialFormValues}
      validateOnMount
      validate={validate}
      onSubmit={handleSubmit}
    >
      {({ isValid, errors, values }) => (
        <Form className={styles.form}>
          <EuiForm component="div" className="databasePanelWrapper" data-testid="connection-form">
            <div className={cx('container relative')}>
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
                      placeholder="Enter the RDI host IP as: https://[IP-Address]"
                      disabled={!!editInstance}
                      append={<AppendInfo content="The RDI machine servers REST API via port 443. Ensure that Redis Insight can access the RDI host over port 443." />}
                      {...field}
                    />
                  )}
                </Field>
              </EuiFormRow>
              <EuiFormRow>
                <EuiFlexGroup responsive={false}>
                  <EuiFlexItem grow={1}>
                    <EuiFormRow label="Username">
                      <Field name="username">
                        {({ field }: { field: FieldInputProps<string> }) => (
                          <EuiFieldText
                            data-testid="connection-form-username-input"
                            fullWidth
                            placeholder="Enter the RDI Redis username"
                            maxLength={500}
                            append={<AppendInfo content="The RDI REST API authentication is using the RDI Redis username and password." />}
                            {...field}
                          />
                        )}
                      </Field>
                    </EuiFormRow>
                  </EuiFlexItem>
                  <EuiFlexItem grow={1}>
                    <EuiFormRow label="Password">
                      <Field name="password">
                        {({ field, form, meta }: {
                          field: FieldInputProps<string>
                          form: FormikHelpers<string>
                          meta: FieldMetaProps<string>
                        }) => (
                          <EuiFieldPassword
                            data-testid="connection-form-password-input"
                            className={styles.passwordField}
                            fullWidth
                            placeholder="Enter the RDI Redis password"
                            maxLength={500}
                            {...field}
                            value={isNull(field.value) ? SECURITY_FIELD : field.value}
                            onFocus={() => {
                              if (isNull(field.value) && !meta.touched) {
                                form.setFieldValue('password', '')
                              }
                            }}
                            append={<AppendInfo content="The RDI REST API authentication is using the RDI Redis username and password." />}
                          />
                        )}
                      </Field>
                    </EuiFormRow>
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiFormRow>
            </div>
            <Footer isValid={isValid} errors={errors} onSubmit={() => handleSubmit(values)} />
          </EuiForm>
        </Form>
      )}
    </Formik>
  )
}

export default ConnectionForm
