import {
  EuiForm,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
  keys,
  EuiTitle,
  EuiButtonIcon, EuiFormRow, EuiFieldText,
} from '@elastic/eui'
import { FormikErrors, useFormik } from 'formik'
import { isEmpty, pick } from 'lodash'
import React, { useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import { useDispatch, useSelector } from 'react-redux'

import { resetInstanceUpdateAction } from 'uiSrc/slices/instances/instances'
import { ConnectionType } from 'uiSrc/slices/interfaces'
import { BuildType } from 'uiSrc/constants/env'
import { appRedirectionSelector } from 'uiSrc/slices/app/url-handling'
import { UrlHandlingActions } from 'uiSrc/slices/interfaces/urlHandling'

import {
  fieldDisplayNames,
  SubmitBtnText,
} from 'uiSrc/pages/home/constants'
import { getFormErrors } from 'uiSrc/pages/home/utils'
import { DbConnectionInfo } from 'uiSrc/pages/home/interfaces'
import {
  DbIndex,
  DbInfo,
  TlsDetails,
  DatabaseForm,
  DbCompressor,
  SSHDetails,
} from 'uiSrc/pages/home/components/form'
import {
  DbInfoSentinel,
  PrimaryGroupSentinel,
  SentinelMasterDatabase,
} from 'uiSrc/pages/home/components/form/sentinel'
import { caCertsSelector } from 'uiSrc/slices/instances/caCerts'
import { clientCertsSelector } from 'uiSrc/slices/instances/clientCerts'
import Divider from 'uiSrc/components/divider/Divider'
import { appInfoSelector } from 'uiSrc/slices/app/info'

import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { selectOnFocus } from 'uiSrc/utils'
import { useModalHeader } from 'uiSrc/contexts/ModalTitleProvider'
import CloneConnection from './components/CloneConnection'
import FooterActions from './components/FooterActions'

export interface Props {
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
  onClickBack?: () => void
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
    onClose,
    onClickBack,
    onSubmit,
    onTestConnection,
    onHostNamePaste,
    submitButtonText,
    buildType,
    loading,
    isEditMode,
    isCloneMode,
    setIsCloneMode,
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
  } = formFields

  const { action } = useSelector(appRedirectionSelector)
  const { data: caCertificates } = useSelector(caCertsSelector)
  const { data: certificates } = useSelector(clientCertsSelector)
  const { server } = useSelector(appInfoSelector)

  const [errors, setErrors] = useState<FormikErrors<DbConnectionInfo>>(
    getInitFieldsDisplayNames({ host, port, name })
  )

  const { setModalHeader } = useModalHeader()

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

  const onKeyDown = (event: React.KeyboardEvent<HTMLFormElement>) => {
    if (event.key === keys.ENTER && !submitIsDisable()) {
      // event.
      formik.submitForm()
    }
  }

  useEffect(() =>
  // componentWillUnmount
    () => {
      setModalHeader(null)
      if (isEditMode) {
        dispatch(resetInstanceUpdateAction())
      }
    },
  [])

  useEffect(() => {
    if (isCloneMode) {
      setModalHeader(
        <EuiFlexGroup responsive={false} alignItems="center" gutterSize="s">
          <EuiFlexItem grow={false}>
            <EuiButtonIcon
              onClick={handleClickBackClone}
              iconSize="m"
              iconType="sortLeft"
              aria-label="back"
              data-testid="back-btn"
            />
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiTitle size="s"><h4>Clone Database</h4></EuiTitle>
          </EuiFlexItem>
        </EuiFlexGroup>
      )
      return
    }

    if (isEditMode) {
      setModalHeader(<EuiTitle size="s"><h4>Edit Database</h4></EuiTitle>)
      return
    }

    setModalHeader(
      <EuiTitle size="s"><h4>Connection Settings</h4></EuiTitle>,
      true
    )
  }, [isEditMode, isCloneMode])

  useEffect(() => {
    formik.resetForm()
  }, [isCloneMode])

  const handleTestConnectionDatabase = () => {
    onTestConnection(formik.values)
  }

  const handleClickBackClone = () => {
    setIsCloneMode(false)
    sendEventTelemetry({
      event: TelemetryEvent.CONFIG_DATABASES_DATABASE_CLONE_CANCELLED,
      eventData: {
        databaseId: id
      }
    })
  }

  const Footer = () => {
    const footerEl = document.getElementById('footerDatabaseForm')

    if (!footerEl) return null

    return ReactDOM.createPortal(
      <FooterActions
        submitIsDisable={submitIsDisable}
        errors={errors}
        isLoading={loading}
        onClickTestConnection={handleTestConnectionDatabase}
        onClose={onClose}
        onClickSubmit={formik.submitForm}
        submitButtonText={submitButtonText}
      />,
      footerEl
    )
  }

  return (
    <div className="relative" data-testid="add-db_manual">
      {isEditMode && !isCloneMode && server?.buildType !== BuildType.RedisStack && (
        <CloneConnection id={id} setIsCloneMode={setIsCloneMode} />
      )}
      <div className="getStartedForm" ref={formRef}>
        {!isEditMode && !isFromCloud && (
          <EuiForm
            component="form"
            onSubmit={formik.handleSubmit}
            data-testid="form"
            onKeyDown={onKeyDown}
          >
            <DatabaseForm
              formik={formik}
              onHostNamePaste={onHostNamePaste}
              showFields={{ host: true, alias: true, port: true, timeout: true }}
            />
            <Divider colorVariable="separatorColor" variant="fullWidth" className="form__divider" />
            <DbIndex
              formik={formik}
            />
            <Divider colorVariable="separatorColor" variant="fullWidth" className="form__divider" />
            <DbCompressor
              formik={formik}
            />
            <Divider colorVariable="separatorColor" variant="fullWidth" className="form__divider" />
            <TlsDetails
              formik={formik}
              certificates={certificates}
              caCertificates={caCertificates}
            />
            {buildType !== BuildType.RedisStack && (
              <>
                <Divider colorVariable="separatorColor" variant="fullWidth" className="form__divider" />
                <SSHDetails
                  formik={formik}
                />
              </>
            )}
          </EuiForm>
        )}
        {(isEditMode || isCloneMode || isFromCloud) && connectionType !== ConnectionType.Sentinel && (
          <>
            {!isCloneMode && (
              <>
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
                <EuiSpacer />
              </>
            )}
            <EuiForm
              component="form"
              onSubmit={formik.handleSubmit}
              data-testid="form"
              onKeyDown={onKeyDown}
            >
              <DatabaseForm
                formik={formik}
                showFields={{
                  alias: true,
                  host: (!isEditMode || isCloneMode) && !isFromCloud,
                  port: !isFromCloud,
                  timeout: true,
                }}
                autoFocus={!isCloneMode && isEditMode}
                onHostNamePaste={onHostNamePaste}
              />
              {isCloneMode && (
                <>
                  <Divider colorVariable="separatorColor" variant="fullWidth" className="form__divider" />
                  <DbIndex
                    formik={formik}
                  />
                </>
              )}
              <Divider colorVariable="separatorColor" variant="fullWidth" className="form__divider" />
              <DbCompressor
                formik={formik}
              />
              <Divider colorVariable="separatorColor" variant="fullWidth" className="form__divider" />
              <TlsDetails
                formik={formik}
                certificates={certificates}
                caCertificates={caCertificates}
              />
              {buildType !== BuildType.RedisStack && (
                <>
                  <Divider colorVariable="separatorColor" variant="fullWidth" className="form__divider" />
                  <SSHDetails
                    formik={formik}
                  />
                </>
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
                    host={host}
                    port={port}
                  />
                  <EuiSpacer />
                  <EuiFlexGroup responsive={false}>
                    <EuiFlexItem>
                      <EuiFormRow label="Database Alias*">
                        <EuiFieldText
                          fullWidth
                          name="name"
                          id="name"
                          data-testid="name"
                          placeholder="Enter Database Alias"
                          onFocus={selectOnFocus}
                          value={formik.values.name ?? ''}
                          maxLength={500}
                          onChange={formik.handleChange}
                        />
                      </EuiFormRow>
                    </EuiFlexItem>
                  </EuiFlexGroup>
                  <EuiSpacer size="s" />
                  <Divider colorVariable="separatorColor" variant="fullWidth" className="form__divider" />
                  <EuiTitle size="xs"><span>Datababase</span></EuiTitle>
                  <EuiSpacer size="s" />
                  <SentinelMasterDatabase
                    formik={formik}
                    db={db}
                    isCloneMode={isCloneMode}
                  />

                  <Divider colorVariable="separatorColor" variant="fullWidth" className="form__divider" />
                  <EuiTitle size="xs"><span>Sentinel</span></EuiTitle>
                  <EuiSpacer size="s" />
                  <DatabaseForm
                    formik={formik}
                    showFields={{ host: false, port: true, alias: false, timeout: false }}
                    onHostNamePaste={onHostNamePaste}
                  />
                  <Divider colorVariable="separatorColor" variant="fullWidth" className="form__divider" />
                  <TlsDetails
                    formik={formik}
                    certificates={certificates}
                    caCertificates={caCertificates}
                  />
                </>
              )}
              {isCloneMode && (
                <>
                  <PrimaryGroupSentinel
                    formik={formik}
                  />
                  <Divider colorVariable="separatorColor" variant="fullWidth" className="form__divider" />
                  <EuiTitle size="xs"><span>Datababase</span></EuiTitle>
                  <EuiSpacer size="s" />
                  <SentinelMasterDatabase
                    formik={formik}
                    db={db}
                    isCloneMode={isCloneMode}
                  />
                  <Divider colorVariable="separatorColor" variant="fullWidth" className="form__divider" />
                  <EuiTitle size="xs"><span>Sentinel</span></EuiTitle>
                  <EuiSpacer size="s" />
                  <DatabaseForm
                    formik={formik}
                    showFields={{ host: true, port: true, alias: false, timeout: false }}
                    onHostNamePaste={onHostNamePaste}
                  />
                  <Divider colorVariable="separatorColor" variant="fullWidth" className="form__divider" />
                  <DbIndex
                    formik={formik}
                  />
                  <Divider colorVariable="separatorColor" variant="fullWidth" className="form__divider" />
                  <DbCompressor
                    formik={formik}
                  />
                  <Divider colorVariable="separatorColor" variant="fullWidth" className="form__divider" />
                  <TlsDetails
                    formik={formik}
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
