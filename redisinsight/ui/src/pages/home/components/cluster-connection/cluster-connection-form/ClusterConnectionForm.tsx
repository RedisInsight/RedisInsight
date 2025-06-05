import React, { ChangeEvent, useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import { isEmpty } from 'lodash'
import { FormikErrors, useFormik } from 'formik'
import { EuiFieldText, EuiForm, EuiIcon, EuiToolTip, keys } from '@elastic/eui'

import { MAX_PORT_NUMBER, validateField } from 'uiSrc/utils/validations'
import { handlePasteHostName } from 'uiSrc/utils'
import validationErrors from 'uiSrc/constants/validationErrors'
import { ICredentialsRedisCluster } from 'uiSrc/slices/interfaces'

import { MessageEnterpriceSoftware } from 'uiSrc/pages/home/components/form/Messages'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { WindowEvent } from 'uiSrc/components/base/utils/WindowEvent'
import {
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { InfoIcon } from 'uiSrc/components/base/icons'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import { NumericInput, PasswordInput } from 'uiSrc/components/base/inputs'

export interface Props {
  host: string
  port: string
  username: string
  password: string
  onHostNamePaste: (text: string) => boolean
  onClose?: () => void
  initialValues: Values
  onSubmit: (values: ICredentialsRedisCluster) => void
  loading: boolean
}

interface ISubmitButton {
  onClick: () => void
  submitIsDisabled: boolean
}

interface Values {
  host: string
  port: string
  username: string
  password: string
}

const fieldDisplayNames: Values = {
  host: 'Cluster Host',
  port: 'Cluster Port',
  username: 'Admin Username',
  // deepcode ignore NoHardcodedPasswords: <Not a passowrd but "password" field placeholder>
  password: 'Admin Password',
}

const ClusterConnectionForm = (props: Props) => {
  const {
    host,
    port,
    username,
    password,
    initialValues: initialValuesProp,
    onHostNamePaste,
    onClose,
    onSubmit,
    loading,
  } = props

  const [errors, setErrors] = useState<FormikErrors<Values>>(
    host || port || username || password ? {} : fieldDisplayNames,
  )

  const [initialValues, setInitialValues] = useState({
    host,
    port: port?.toString(),
    username,
    password,
  })

  useEffect(() => {
    const values = {
      ...initialValues,
      ...initialValuesProp,
    }

    setInitialValues(values)
    formik.validateForm(values)
  }, [initialValuesProp])

  const validate = (values: Values) => {
    const errs: FormikErrors<Values> = {}

    Object.entries(values).forEach(
      ([key, value]) =>
        !value && Object.assign(errs, { [key]: fieldDisplayNames[key] }),
    )

    setErrors(errs)
    return errs
  }

  const formik = useFormik({
    initialValues,
    validate,
    enableReinitialize: true,
    validateOnMount: true,
    validateOnBlur: false,
    onSubmit: (values) => {
      onSubmit({ ...values, port: parseInt(values.port) })
    },
  })

  const submitIsEnable = () => isEmpty(errors)

  const onKeyDown = (event: any) => {
    if (event.key === keys.ENTER && submitIsEnable()) {
      formik.submitForm()
      event.stopPropagation()
    }
  }

  const AppendHostName = () => (
    <EuiToolTip
      title={
        <div>
          <p>
            <b>Pasting a connection URL auto fills the database details.</b>
          </p>
          <p style={{ margin: 0, paddingTop: '10px' }}>
            The following connection URLs are supported:
          </p>
        </div>
      }
      className="homePage_tooltip"
      anchorClassName="inputAppendIcon"
      position="right"
      content={
        <ul className="homePage_toolTipUl">
          <li>
            <span className="dot" />
            redis://[[username]:[password]]@host:port
          </li>
          <li>
            <span className="dot" />
            rediss://[[username]:[password]]@host:port
          </li>
          <li>
            <span className="dot" />
            host:port
          </li>
        </ul>
      }
    >
      <EuiIcon type="iInCircle" style={{ cursor: 'pointer' }} />
    </EuiToolTip>
  )

  const CancelButton = ({ onClick }: { onClick: () => void }) => (
    <SecondaryButton
      size="s"
      className="btn-cancel"
      onClick={onClick}
      style={{ marginRight: 12 }}
    >
      Cancel
    </SecondaryButton>
  )

  const SubmitButton = ({ onClick, submitIsDisabled }: ISubmitButton) => (
    <EuiToolTip
      position="top"
      anchorClassName="euiToolTip__btn-disabled"
      title={
        submitIsDisabled
          ? validationErrors.REQUIRED_TITLE(Object.values(errors).length)
          : null
      }
      content={
        submitIsDisabled ? (
          <span className="euiToolTip__content">
            {Object.values(errors).map((err) => [err, <br key={err} />])}
          </span>
        ) : null
      }
    >
      <PrimaryButton
        size="s"
        type="submit"
        onClick={onClick}
        disabled={submitIsDisabled}
        loading={loading}
        icon={submitIsDisabled ? InfoIcon : undefined}
        data-testid="btn-submit"
      >
        Submit
      </PrimaryButton>
    </EuiToolTip>
  )

  const Footer = () => {
    const footerEl = document.getElementById('footerDatabaseForm')
    if (footerEl) {
      return ReactDOM.createPortal(
        <div className="footerAddDatabase">
          {onClose && <CancelButton onClick={onClose} />}
          <SubmitButton
            onClick={formik.submitForm}
            submitIsDisabled={!submitIsEnable()}
          />
        </div>,
        footerEl,
      )
    }
    return null
  }

  return (
    <div className="getStartedForm eui-yScroll" data-testid="add-db_cluster">
      <MessageEnterpriceSoftware />
      <br />

      <EuiForm>
        <WindowEvent event="keydown" handler={onKeyDown} />
        <Row responsive>
          <FlexItem grow={4}>
            <FormField label="Cluster Host*">
              <EuiFieldText
                name="host"
                id="host"
                data-testid="host"
                maxLength={200}
                placeholder="Enter Cluster Host"
                value={formik.values.host}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  formik.setFieldValue(
                    e.target.name,
                    validateField(e.target.value.trim()),
                  )
                }}
                onPaste={(event: React.ClipboardEvent<HTMLInputElement>) =>
                  handlePasteHostName(onHostNamePaste, event)
                }
                append={<AppendHostName />}
              />
            </FormField>
          </FlexItem>

          <FlexItem grow={2}>
            <FormField
              label="Cluster Port*"
              additionalText="Should not exceed 65535."
            >
              <NumericInput
                autoValidate
                min={0}
                max={MAX_PORT_NUMBER}
                name="port"
                id="port"
                data-testid="port"
                placeholder="Enter Cluster Port"
                value={Number(formik.values.port)}
                onChange={(value) => formik.setFieldValue('port', value)}
              />
            </FormField>
          </FlexItem>
        </Row>

        <Row responsive>
          <FlexItem grow>
            <FormField label="Admin Username*">
              <EuiFieldText
                name="username"
                id="username"
                data-testid="username"
                fullWidth
                maxLength={200}
                placeholder="Enter Admin Username"
                value={formik.values.username}
                onChange={formik.handleChange}
              />
            </FormField>
          </FlexItem>

          <FlexItem grow>
            <FormField label="Admin Password*">
              <PasswordInput
                type="dual"
                name="password"
                id="password"
                data-testid="password"
                maxLength={200}
                placeholder="Enter Password"
                value={formik.values.password}
                onChange={formik.handleChange}
                autoComplete="new-password"
              />
            </FormField>
          </FlexItem>
        </Row>
      </EuiForm>
      <Footer />
    </div>
  )
}

export default ClusterConnectionForm
