import {
  EuiButton,
  EuiCollapsibleNavGroup,
  EuiForm,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
  EuiToolTip,
  keys,
  EuiButtonEmpty,
} from '@elastic/eui'
import { FormikErrors, useFormik } from 'formik'
import { isEmpty, pick } from 'lodash'
import React, { useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import { useDispatch, useSelector } from 'react-redux'

import validationErrors from 'uiSrc/constants/validationErrors'
import DatabaseAlias from 'uiSrc/pages/home/components/database-alias'
import { useResizableFormField } from 'uiSrc/services'
import { resetInstanceUpdateAction } from 'uiSrc/slices/instances/instances'
import { ConnectionType } from 'uiSrc/slices/interfaces'
import { isRediStack } from 'uiSrc/utils'
import { BuildType } from 'uiSrc/constants/env'
import { appRedirectionSelector } from 'uiSrc/slices/app/url-handling'
import { UrlHandlingActions } from 'uiSrc/slices/interfaces/urlHandling'

import {
  fieldDisplayNames,
  SubmitBtnText,
} from 'uiSrc/pages/home/constants'
import { getFormErrors, getSubmitButtonContent } from 'uiSrc/pages/home/utils'
import { DbConnectionInfo, ISubmitButton } from 'uiSrc/pages/home/interfaces'
import {
  DbIndex,
  DbInfo,
  MessageStandalone,
  TlsDetails,
  DatabaseForm,
  DbCompressor,
  SSHDetails,
} from 'uiSrc/pages/home/components/form'
import {
  DbInfoSentinel,
  PrimaryGroupSentinel,
  SentinelHostPort,
  SentinelMasterDatabase,
} from 'uiSrc/pages/home/components/form/sentinel'
import { caCertsSelector } from 'uiSrc/slices/instances/caCerts'
import { clientCertsSelector } from 'uiSrc/slices/instances/clientCerts'

export interface Props {
  width: number
  formFields: DbConnectionInfo
  submitButtonText?: SubmitBtnText
  loading: boolean
  buildType?: BuildType
  isEditMode: boolean
  isCloneMode: boolean
  setIsCloneMode: (value: boolean) => void
  onSubmit: (values: DbConnectionInfo) => void
  onTestConnection: (values: DbConnectionInfo) => void
  onHostNamePaste: (content: string) => boolean
  onClose?: () => void
  onAliasEdited?: (value: string) => void
}

const getInitFieldsDisplayNames = ({ host, port, name }: any) => {
  if (!host || !port || !name) {
    return pick(fieldDisplayNames, ['host', 'port', 'name'])
  }
  return {}
}

const ManualConnectionForm = (props: Props) => {
  const {
    formFields,
    width,
    onClose,
    onSubmit,
    onTestConnection,
    onHostNamePaste,
    submitButtonText,
    buildType,
    loading,
    isEditMode,
    isCloneMode,
    setIsCloneMode,
    onAliasEdited,
  } = props

  const {
    id,
    host,
    name,
    port,
    db = null,
    nameFromProvider,
    sentinelMaster,
    connectionType,
    nodes = null,
    modules,
    provider,
    version,
  } = formFields

  const { action } = useSelector(appRedirectionSelector)
  const { data: caCertificates } = useSelector(caCertsSelector)
  const { data: certificates } = useSelector(clientCertsSelector)

  const [errors, setErrors] = useState<FormikErrors<DbConnectionInfo>>(
    getInitFieldsDisplayNames({ host, port, name })
  )

  const dispatch = useDispatch()

  const formRef = useRef<HTMLDivElement>(null)

  const submitIsDisable = () => !isEmpty(errors)
  const isFromCloud = action === UrlHandlingActions.Connect

  const validate = (values: DbConnectionInfo) => {
    const errs = getFormErrors(values)

    if (isCloneMode && connectionType === ConnectionType.Sentinel && !values.sentinelMasterName) {
      errs.sentinelMasterName = fieldDisplayNames.sentinelMasterName
    }

    if (!values.name) {
      errs.name = fieldDisplayNames.name
    }

    setErrors(errs)
    return errs
  }

  const formik = useFormik({
    initialValues: formFields,
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

  useEffect(() =>
  // componentWillUnmount
    () => {
      if (isEditMode) {
        dispatch(resetInstanceUpdateAction())
      }
    },
  [])

  useEffect(() => {
    formik.resetForm()
  }, [isCloneMode])

  const handleTestConnectionDatabase = () => {
    onTestConnection(formik.values)
  }

  const SubmitButton = ({
    text = '',
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
        {text}
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
          <EuiFlexItem className="btn-back" grow={false}>
            <EuiToolTip
              position="top"
              anchorClassName="euiToolTip__btn-disabled"
              title={
                submitIsDisable()
                  ? validationErrors.REQUIRED_TITLE(Object.keys(errors).length)
                  : null
              }
              content={getSubmitButtonContent(errors, submitIsDisable())}
            >
              <EuiButtonEmpty
                className="empty-btn"
                onClick={handleTestConnectionDatabase}
                disabled={submitIsDisable()}
                isLoading={loading}
                iconType={submitIsDisable() ? 'iInCircle' : undefined}
                data-testid="btn-test-connection"
              >
                Test Connection
              </EuiButtonEmpty>
            </EuiToolTip>
          </EuiFlexItem>

          <EuiFlexItem grow={false}>
            <EuiFlexGroup responsive={false} gutterSize="none">
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
                text={submitButtonText}
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
      {isEditMode && name && (
        <div className="fluid" style={{ marginBottom: 15 }}>
          <DatabaseAlias
            isRediStack={isRediStack(modules, version)}
            isCloneMode={isCloneMode}
            alias={name}
            database={db}
            isLoading={loading}
            id={id}
            provider={provider}
            modules={modules}
            setIsCloneMode={setIsCloneMode}
            onAliasEdited={onAliasEdited}
          />
        </div>
      )}
      <div className="getStartedForm" ref={formRef}>
        {!isEditMode && !isFromCloud && (
          <>
            <MessageStandalone />
            <br />
          </>
        )}
        {!isEditMode && !isFromCloud && (
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
              onHostNamePaste={onHostNamePaste}
              showFields={{ host: true, alias: true, port: true, timeout: true }}
            />
            <DbIndex
              formik={formik}
              flexItemClassName={flexItemClassName}
              flexGroupClassName={flexGroupClassName}
            />
            <DbCompressor
              formik={formik}
              flexItemClassName={flexItemClassName}
              flexGroupClassName={flexGroupClassName}
            />
            <TlsDetails
              formik={formik}
              flexItemClassName={flexItemClassName}
              flexGroupClassName={flexGroupClassName}
              certificates={certificates}
              caCertificates={caCertificates}
            />
            {buildType !== BuildType.RedisStack && (
              <SSHDetails
                formik={formik}
                flexItemClassName={flexItemClassName}
                flexGroupClassName={flexGroupClassName}
              />
            )}
          </EuiForm>
        )}
        {(isEditMode || isCloneMode || isFromCloud) && connectionType !== ConnectionType.Sentinel && (
          <>
            {!isCloneMode && (
              <DbInfo
                host={host}
                port={port}
                connectionType={connectionType}
                db={db}
                modules={modules}
                nameFromProvider={nameFromProvider}
                nodes={nodes}
                isFromCloud={isFromCloud}
              />
            )}
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
                showFields={{
                  alias: !isEditMode || isCloneMode,
                  host: (!isEditMode || isCloneMode) && !isFromCloud,
                  port: !isFromCloud,
                  timeout: true,
                }}
                autoFocus={!isCloneMode && isEditMode}
                onHostNamePaste={onHostNamePaste}
              />
              {isCloneMode && (
                <DbIndex
                  formik={formik}
                  flexItemClassName={flexItemClassName}
                  flexGroupClassName={flexGroupClassName}
                />
              )}
              <DbCompressor
                formik={formik}
                flexItemClassName={flexItemClassName}
                flexGroupClassName={flexGroupClassName}
              />
              <TlsDetails
                formik={formik}
                flexItemClassName={flexItemClassName}
                flexGroupClassName={flexGroupClassName}
                certificates={certificates}
                caCertificates={caCertificates}
              />
              {buildType !== BuildType.RedisStack && (
                <SSHDetails
                  formik={formik}
                  flexItemClassName={flexItemClassName}
                  flexGroupClassName={flexGroupClassName}
                />
              )}
            </EuiForm>
          </>
        )}
        {(isEditMode || isCloneMode) && connectionType === ConnectionType.Sentinel && (
          <>
            <EuiForm
              component="form"
              onSubmit={formik.handleSubmit}
              data-testid="form"
              onKeyDown={onKeyDown}
            >
              {!isCloneMode && (
                <>
                  <DbInfoSentinel
                    nameFromProvider={nameFromProvider}
                    connectionType={connectionType}
                    sentinelMaster={sentinelMaster}
                  />
                  <EuiCollapsibleNavGroup
                    title="Database"
                    isCollapsible
                    initialIsOpen={false}
                    data-testid="database-nav-group"
                  >
                    <SentinelMasterDatabase
                      formik={formik}
                      flexItemClassName={flexItemClassName}
                      flexGroupClassName={flexGroupClassName}
                      db={db}
                      isCloneMode={isCloneMode}
                    />
                  </EuiCollapsibleNavGroup>
                  <EuiCollapsibleNavGroup
                    title="Sentinel"
                    isCollapsible
                    initialIsOpen={false}
                    data-testid="sentinel-nav-group"
                  >
                    <SentinelHostPort
                      host={host}
                      port={port}
                    />
                    <DatabaseForm
                      formik={formik}
                      flexItemClassName={flexItemClassName}
                      flexGroupClassName={flexGroupClassName}
                      showFields={{ host: false, port: true, alias: false, timeout: false }}
                      onHostNamePaste={onHostNamePaste}
                    />
                  </EuiCollapsibleNavGroup>
                  <EuiCollapsibleNavGroup
                    title="TLS Details"
                    isCollapsible
                    initialIsOpen={false}
                  >
                    <TlsDetails
                      formik={formik}
                      flexItemClassName={flexItemClassName}
                      flexGroupClassName={flexGroupClassName}
                      certificates={certificates}
                      caCertificates={caCertificates}
                    />
                  </EuiCollapsibleNavGroup>
                </>
              )}
              {isCloneMode && (
                <>
                  <PrimaryGroupSentinel
                    formik={formik}
                    flexItemClassName={flexItemClassName}
                    flexGroupClassName={flexGroupClassName}
                  />
                  <EuiCollapsibleNavGroup
                    title="Database"
                    isCollapsible
                    initialIsOpen={false}
                    data-testid="database-nav-group-clone"
                  >
                    <SentinelMasterDatabase
                      formik={formik}
                      flexItemClassName={flexItemClassName}
                      flexGroupClassName={flexGroupClassName}
                      db={db}
                      isCloneMode={isCloneMode}
                    />
                  </EuiCollapsibleNavGroup>
                  <EuiCollapsibleNavGroup
                    title="Sentinel"
                    isCollapsible
                    initialIsOpen={false}
                    data-testid="sentinel-nav-group-clone"
                  >
                    <DatabaseForm
                      formik={formik}
                      flexItemClassName={flexItemClassName}
                      flexGroupClassName={flexGroupClassName}
                      showFields={{ host: true, port: true, alias: false, timeout: false }}
                      onHostNamePaste={onHostNamePaste}
                    />
                  </EuiCollapsibleNavGroup>
                  <EuiSpacer size="m" />
                  <DbIndex
                    formik={formik}
                    flexItemClassName={flexItemClassName}
                    flexGroupClassName={flexGroupClassName}
                  />
                  <DbCompressor
                    formik={formik}
                    flexItemClassName={flexItemClassName}
                    flexGroupClassName={flexGroupClassName}
                  />
                  <TlsDetails
                    formik={formik}
                    flexItemClassName={flexItemClassName}
                    flexGroupClassName={flexGroupClassName}
                    certificates={certificates}
                    caCertificates={caCertificates}
                  />
                </>
              )}
            </EuiForm>
          </>
        )}
      </div>
      <Footer />
    </div>
  )
}

export default ManualConnectionForm
