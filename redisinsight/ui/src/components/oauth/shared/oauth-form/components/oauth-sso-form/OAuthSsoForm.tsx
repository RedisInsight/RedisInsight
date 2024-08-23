import { isEmpty } from 'lodash'
import React, { ChangeEvent, useState } from 'react'
import {
  EuiButton,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiFormRow,
  EuiSpacer, EuiTitle, EuiToolTip,
} from '@elastic/eui'
import { FormikErrors, useFormik } from 'formik'
import { validateEmail, validateField } from 'uiSrc/utils'

import styles from './styles.module.scss'

export interface Props {
  onBack: () => void,
  onSubmit: (values: { email: string }) => any,
}

interface Values {
  email: string;
}

const OAuthSsoForm = ({
  onBack,
  onSubmit,
}: Props) => {
  const [validationErrors, setValidationErrors] = useState<FormikErrors<Values>>({ email: '' })

  const validate = (values: Values) => {
    const errs: FormikErrors<Values> = {}

    if (!values?.email || !validateEmail(values.email)) {
      errs.email = 'Invalid email'
    }

    setValidationErrors(errs)

    return errs
  }

  const formik = useFormik({
    initialValues: {
      email: '',
    },
    validate,
    onSubmit,
  })

  const submitIsDisabled = () => !isEmpty(validationErrors)

  const SubmitButton = ({
    text,
    disabled,
  }: { disabled: boolean, text: string }) => (
    <EuiToolTip
      position="top"
      anchorClassName="euiToolTip__btn-disabled"
      data-testid="btn-submit-tooltip"
      content={disabled ? (
        <>
          <p>Email must be in the format</p>
          <p>email@example.com without spaces</p>
        </>
      ) : null}
    >
      <EuiButton
        fill
        size="s"
        color="secondary"
        type="submit"
        disabled={disabled}
        iconType={disabled ? 'iInCircle' : undefined}
        data-testid="btn-submit"
      >
        {text}
      </EuiButton>
    </EuiToolTip>
  )

  return (
    <div className={styles.container} data-testid="oauth-container-sso-form">
      <EuiTitle className={styles.title} size="xs"><h4>Single Sign-On</h4></EuiTitle>
      <EuiForm component="form" onSubmit={formik.handleSubmit}>
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiFormRow className={styles.formRaw} label="Email">
              <EuiFieldText
                name="email"
                id="sso-email"
                data-testid="sso-email"
                maxLength={200}
                value={formik.values.email}
                autoComplete="off"
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  formik.setFieldValue(e.target.name, validateField(e.target.value.trim()))
                }}
              />
            </EuiFormRow>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer />
        <EuiFlexGroup justifyContent="flexEnd" responsive={false}>
          <EuiFlexItem grow={false}>
            <EuiButton
              color="secondary"
              type="button"
              size="s"
              onClick={onBack}
              data-testid="btn-back"
            >
              Back
            </EuiButton>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <SubmitButton
              text="Login"
              disabled={submitIsDisabled()}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiForm>
    </div>
  )
}

export default OAuthSsoForm
