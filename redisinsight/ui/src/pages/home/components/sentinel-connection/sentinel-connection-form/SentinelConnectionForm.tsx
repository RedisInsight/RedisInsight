import {
  EuiButton,
  EuiForm,
  EuiFlexGroup,
  EuiFlexItem,
  EuiToolTip,
  keys,
} from '@elastic/eui'
import { FormikErrors, useFormik } from 'formik'
import { isEmpty, pick } from 'lodash'
import React, { useRef, useState } from 'react'
import ReactDOM from 'react-dom'

import validationErrors from 'uiSrc/constants/validationErrors'
import { useResizableFormField } from 'uiSrc/services'
import {
  fieldDisplayNames,
} from 'uiSrc/pages/home/constants'
import { getFormErrors, getSubmitButtonContent } from 'uiSrc/pages/home/utils'
import { DbConnectionInfo, ISubmitButton } from 'uiSrc/pages/home/interfaces'
import {
  MessageSentinel,
  TlsDetails,
  DatabaseForm,
} from 'uiSrc/pages/home/components/form'

export interface Props {
  width: number
  loading: boolean
  initialValues: DbConnectionInfo
  certificates: { id: string; name: string }[],
  caCertificates: { id: string; name: string }[],
  onSubmit: (values: DbConnectionInfo) => void
  onHostNamePaste: (content: string) => boolean
  onClose?: () => void
}

const getInitFieldsDisplayNames = ({ host, port }: any) => {
  if (!host || !port) {
    return pick(fieldDisplayNames, ['host', 'port'])
  }
  return {}
}

const SentinelConnectionForm = (props: Props) => {
  const {
    initialValues = {},
    width,
    onClose,
    onSubmit,
    onHostNamePaste,
    loading,
    certificates,
    caCertificates,
  } = props

  const [errors, setErrors] = useState<FormikErrors<DbConnectionInfo>>(
    getInitFieldsDisplayNames(initialValues)
  )

  const formRef = useRef<HTMLDivElement>(null)

  const submitIsDisable = () => !isEmpty(errors)

  const validate = (values: DbConnectionInfo) => {
    const errs = getFormErrors(values)
    setErrors(errs)
    return errs
  }

  const formik = useFormik({
    initialValues,
    validate,
    enableReinitialize: true,
    validateOnMount: true,
    onSubmit: (values: any) => {
      onSubmit(values)
    },
  })

  const [flexGroupClassName, flexItemClassName] = useResizableFormField(
    formRef,
    width
  )

  const onKeyDown = (event: React.KeyboardEvent<HTMLFormElement>) => {
    if (event.key === keys.ENTER && !submitIsDisable()) {
      // event.
      formik.submitForm()
    }
  }

  const SubmitButton = ({
    onClick,
    submitIsDisabled,
  }: ISubmitButton) => (
    <EuiToolTip
      position="top"
      anchorClassName="euiToolTip__btn-disabled"
      title={
        submitIsDisabled
          ? validationErrors.REQUIRED_TITLE(Object.keys(errors).length)
          : null
      }
      content={getSubmitButtonContent(errors, submitIsDisabled)}
    >
      <EuiButton
        fill
        color="secondary"
        type="submit"
        onClick={onClick}
        disabled={submitIsDisabled}
        isLoading={loading}
        iconType={submitIsDisabled ? 'iInCircle' : undefined}
        data-testid="btn-submit"
      >
        Discover Database
      </EuiButton>
    </EuiToolTip>
  )

  const Footer = () => {
    const footerEl = document.getElementById('footerDatabaseForm')

    if (footerEl) {
      return ReactDOM.createPortal(
        <EuiFlexGroup
          justifyContent="spaceBetween"
          alignItems="center"
          className="footerAddDatabase"
          gutterSize="none"
          responsive={false}
        >
          <EuiFlexItem className="btn-back" grow={false} />
          <EuiFlexItem grow={false}>
            <EuiFlexGroup responsive={false}>
              {onClose && (
                <EuiButton
                  onClick={onClose}
                  color="secondary"
                  className="btn-cancel"
                  data-testid="btn-cancel"
                >
                  Cancel
                </EuiButton>
              )}
              <SubmitButton
                onClick={formik.submitForm}
                submitIsDisabled={submitIsDisable()}
              />
            </EuiFlexGroup>
          </EuiFlexItem>
        </EuiFlexGroup>,
        footerEl
      )
    }
    return null
  }

  return (
    <div className="relative">
      <div className="getStartedForm" ref={formRef}>
        <MessageSentinel />
        <br />
        <EuiForm
          component="form"
          onSubmit={formik.handleSubmit}
          data-testid="form"
          onKeyDown={onKeyDown}
        >
          <DatabaseForm
            formik={formik}
            flexItemClassName={flexItemClassName}
            flexGroupClassName={flexGroupClassName}
            showFields={{ host: true, port: true, alias: false, timeout: false }}
            onHostNamePaste={onHostNamePaste}
          />
          <TlsDetails
            formik={formik}
            flexItemClassName={flexItemClassName}
            flexGroupClassName={flexGroupClassName}
            certificates={certificates}
            caCertificates={caCertificates}
          />
        </EuiForm>
      </div>
      <Footer />
    </div>
  )
}

export default SentinelConnectionForm
