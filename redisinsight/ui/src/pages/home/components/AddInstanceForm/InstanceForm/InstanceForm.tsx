import {
  EuiButton,
  EuiCollapsibleNavGroup,
  EuiForm,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
  EuiToolTip,
  keys,
} from '@elastic/eui'

import { FormikErrors, useFormik } from 'formik'
import { isEmpty, pick, toString } from 'lodash'
import React, { useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router'
import { PageNames, Pages } from 'uiSrc/constants'
import validationErrors from 'uiSrc/constants/validationErrors'
import DatabaseAlias from 'uiSrc/pages/home/components/DatabaseAlias'
import { useResizableFormField } from 'uiSrc/services'
import { appContextSelector, setAppContextInitialState } from 'uiSrc/slices/app/context'
import { resetKeys } from 'uiSrc/slices/browser/keys'
import {
  changeInstanceAliasAction,
  checkConnectToInstanceAction,
  resetInstanceUpdateAction,
  setConnectedInstanceId,
} from 'uiSrc/slices/instances/instances'

import { ConnectionType, InstanceType, } from 'uiSrc/slices/interfaces'
import { getRedisModulesSummary, sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { getDiffKeysOfObjectValues, isRediStack } from 'uiSrc/utils'
import { BuildType } from 'uiSrc/constants/env'

import {
  ADD_NEW_CA_CERT,
  NO_CA_CERT,
  ADD_NEW,
  fieldDisplayNames,
  SshPassType,
  DEFAULT_TIMEOUT,
  NONE,
} from './constants'

import { DbConnectionInfo, ISubmitButton } from './interfaces'
import {
  DbIndex,
  DbInfo,
  MessageSentinel,
  MessageStandalone,
  TlsDetails,
  DatabaseForm,
  DbCompressor
} from './form-components'
import {
  DbInfoSentinel,
  PrimaryGroupSentinel,
  SentinelHostPort,
  SentinelMasterDatabase,
} from './form-components/sentinel'
import SSHDetails from './form-components/SSHDetails'
import { LoadingDatabaseText, SubmitBtnText, TitleDatabaseText, } from '../InstanceFormWrapper'

export interface Props {
  width: number
  isResizablePanel?: boolean
  formFields: DbConnectionInfo
  submitButtonText?: SubmitBtnText
  titleText?: TitleDatabaseText
  loading: boolean
  buildType?: BuildType
  instanceType: InstanceType
  loadingMsg: LoadingDatabaseText
  isEditMode: boolean
  isCloneMode: boolean
  setIsCloneMode: (value: boolean) => void
  initialValues: DbConnectionInfo
  onSubmit: (values: DbConnectionInfo) => void
  onTestConnection: (values: DbConnectionInfo) => void
  updateEditingName: (name: string) => void
  onHostNamePaste: (content: string) => boolean
  onClose?: () => void
  onAliasEdited?: (value: string) => void
  setErrorMsgRef?: (database: HTMLDivElement | null) => void
}

const getInitFieldsDisplayNames = ({ host, port, name, instanceType }: any) => {
  if (!host || !port) {
    if (!name && instanceType !== InstanceType.Sentinel) {
      return pick(fieldDisplayNames, ['host', 'port', 'name'])
    }
    return pick(fieldDisplayNames, ['host', 'port'])
  }
  return {}
}

const getDefaultHost = () => '127.0.0.1'
const getDefaultPort = (instanceType: InstanceType) => (instanceType === InstanceType.Sentinel ? '26379' : '6379')

const AddStandaloneForm = (props: Props) => {
  const {
    formFields: {
      id,
      host,
      name,
      port,
      tls,
      db = null,
      compressor = NONE,
      nameFromProvider,
      sentinelMaster,
      connectionType,
      nodes = null,
      tlsClientAuthRequired,
      certificates,
      selectedTlsClientCertId = '',
      verifyServerTlsCert,
      caCertificates,
      selectedCaCertName,
      username,
      password,
      timeout,
      modules,
      sentinelMasterPassword,
      sentinelMasterUsername,
      servername,
      provider,
      ssh,
      sshPassType = SshPassType.Password,
      sshOptions,
      version,
    },
    initialValues: initialValuesProp,
    width,
    onClose,
    onSubmit,
    onTestConnection,
    onHostNamePaste,
    submitButtonText,
    instanceType,
    buildType,
    loading,
    isEditMode,
    isCloneMode,
    setIsCloneMode,
    onAliasEdited,
  } = props

  const { contextInstanceId, lastPage } = useSelector(appContextSelector)

  const prepareInitialValues = () => ({
    host: host ?? getDefaultHost(),
    port: port ? port.toString() : getDefaultPort(instanceType),
    timeout: timeout ? timeout.toString() : toString(DEFAULT_TIMEOUT / 1_000),
    name: name ?? `${getDefaultHost()}:${getDefaultPort(instanceType)}`,
    username,
    password,
    tls,
    db,
    compressor,
    modules,
    showDb: !!db,
    showCompressor: compressor !== NONE,
    sni: !!servername,
    servername,
    newCaCert: '',
    newCaCertName: '',
    selectedCaCertName,
    tlsClientAuthRequired,
    verifyServerTlsCert,
    newTlsCertPairName: '',
    selectedTlsClientCertId,
    newTlsClientCert: '',
    newTlsClientKey: '',
    sentinelMasterName: sentinelMaster?.name || '',
    sentinelMasterUsername,
    sentinelMasterPassword,
    ssh,
    sshPassType,
    sshHost: sshOptions?.host ?? '',
    sshPort: sshOptions?.port ?? 22,
    sshUsername: sshOptions?.username ?? '',
    sshPassword: sshOptions?.password ?? '',
    sshPrivateKey: sshOptions?.privateKey ?? '',
    sshPassphrase: sshOptions?.passphrase ?? ''
  })

  const [initialValues, setInitialValues] = useState(prepareInitialValues())

  const [errors, setErrors] = useState<FormikErrors<DbConnectionInfo>>(
    getInitFieldsDisplayNames({ host, port, name, instanceType })
  )

  useEffect(() => {
    const values = prepareInitialValues()

    setInitialValues(values)
    formik.setValues(values)
  }, [initialValuesProp, isCloneMode])

  const history = useHistory()
  const dispatch = useDispatch()

  const formRef = useRef<HTMLDivElement>(null)

  const submitIsDisable = () => !isEmpty(errors)

  const validate = (values: DbConnectionInfo) => {
    const errs: FormikErrors<DbConnectionInfo> = {}

    if (!values.host) {
      errs.host = fieldDisplayNames.host
    }
    if (!values.port) {
      errs.port = fieldDisplayNames.port
    }

    if (!values.name && instanceType !== InstanceType.Sentinel) {
      errs.name = fieldDisplayNames.name
    }

    if (
      values.tls
      && values.verifyServerTlsCert
      && values.selectedCaCertName === NO_CA_CERT
    ) {
      errs.selectedCaCertName = fieldDisplayNames.selectedCaCertName
    }

    if (
      values.tls
      && values.selectedCaCertName === ADD_NEW_CA_CERT
      && values.newCaCertName === ''
    ) {
      errs.newCaCertName = fieldDisplayNames.newCaCertName
    }

    if (
      values.tls
      && values.selectedCaCertName === ADD_NEW_CA_CERT
      && values.newCaCert === ''
    ) {
      errs.newCaCert = fieldDisplayNames.newCaCert
    }

    if (
      values.tls
      && values.sni
      && values.servername === ''
    ) {
      errs.servername = fieldDisplayNames.servername
    }

    if (
      values.tls
      && values.tlsClientAuthRequired
      && values.selectedTlsClientCertId === ADD_NEW
    ) {
      if (values.newTlsCertPairName === '') {
        errs.newTlsCertPairName = fieldDisplayNames.newTlsCertPairName
      }
      if (values.newTlsClientCert === '') {
        errs.newTlsClientCert = fieldDisplayNames.newTlsClientCert
      }
      if (values.newTlsClientKey === '') {
        errs.newTlsClientKey = fieldDisplayNames.newTlsClientKey
      }
    }

    if (isCloneMode && connectionType === ConnectionType.Sentinel && !values.sentinelMasterName) {
      errs.sentinelMasterName = fieldDisplayNames.sentinelMasterName
    }

    if (values.ssh) {
      if (!values.sshHost) {
        errs.sshHost = fieldDisplayNames.sshHost
      }
      if (!values.sshPort) {
        errs.sshPort = fieldDisplayNames.sshPort
      }
      if (!values.sshUsername) {
        errs.sshUsername = fieldDisplayNames.sshUsername
      }
      if (values.sshPassType === SshPassType.PrivateKey && !values.sshPrivateKey) {
        errs.sshPrivateKey = fieldDisplayNames.sshPrivateKey
      }
    }

    setErrors(errs)
    return errs
  }

  const formik = useFormik({
    initialValues,
    validate,
    enableReinitialize: true,
    onSubmit: (values: any) => {
      if (isCloneMode) {
        const diffKeys = getDiffKeysOfObjectValues(formik.initialValues, values)
        sendEventTelemetry({
          event: TelemetryEvent.CONFIG_DATABASES_DATABASE_CLONE_CONFIRMED,
          eventData: {
            fieldsModified: diffKeys
          }
        })
      }
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

  const handleCheckConnectToInstance = () => {
    const modulesSummary = getRedisModulesSummary(modules)
    sendEventTelemetry({
      event: TelemetryEvent.CONFIG_DATABASES_OPEN_DATABASE_BUTTON_CLICKED,
      eventData: {
        databaseId: id,
        provider,
        ...modulesSummary,
      }
    })
    dispatch(checkConnectToInstanceAction(id, connectToInstance))
  }

  const handleCloneDatabase = () => {
    setIsCloneMode(true)
    sendEventTelemetry({
      event: TelemetryEvent.CONFIG_DATABASES_DATABASE_CLONE_REQUESTED,
      eventData: {
        databaseId: id
      }
    })
  }

  const handleBackCloneDatabase = () => {
    setIsCloneMode(false)
    sendEventTelemetry({
      event: TelemetryEvent.CONFIG_DATABASES_DATABASE_CLONE_CANCELLED,
      eventData: {
        databaseId: id
      }
    })
  }

  const handleTestConnectionDatabase = () => {
    onTestConnection(formik.values)
  }

  const handleChangeDatabaseAlias = (
    value: string,
    onSuccess?: () => void,
    onFail?: () => void
  ) => {
    dispatch(changeInstanceAliasAction(
      id,
      value,
      () => {
        onAliasEdited?.(value)
        onSuccess?.()
      },
      onFail
    ))
  }

  const connectToInstance = () => {
    if (contextInstanceId && contextInstanceId !== id) {
      dispatch(resetKeys())
      dispatch(setAppContextInitialState())
    }
    dispatch(setConnectedInstanceId(id ?? ''))

    if (lastPage === PageNames.workbench && contextInstanceId === id) {
      history.push(Pages.workbench(id))
      return
    }
    history.push(Pages.browser(id))
  }

  const getSubmitButtonContent = (submitIsDisabled?: boolean) => {
    const maxErrorsCount = 5
    const errorsArr = Object.values(errors).map((err) => [
      err,
      <br key={err} />,
    ])

    if (errorsArr.length > maxErrorsCount) {
      errorsArr.splice(maxErrorsCount, errorsArr.length, ['...'])
    }
    return submitIsDisabled ? (
      <span className="euiToolTip__content">{errorsArr}</span>
    ) : null
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
      content={getSubmitButtonContent(submitIsDisabled)}
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
            {instanceType !== InstanceType.Sentinel && (
              <EuiToolTip
                position="top"
                anchorClassName="euiToolTip__btn-disabled"
                title={
                  submitIsDisable()
                    ? validationErrors.REQUIRED_TITLE(Object.keys(errors).length)
                    : null
                }
                content={getSubmitButtonContent(submitIsDisable())}
              >
                <EuiButton
                  className="empty-btn"
                  onClick={handleTestConnectionDatabase}
                  disabled={submitIsDisable()}
                  isLoading={loading}
                  iconType={submitIsDisable() ? 'iInCircle' : undefined}
                  data-testid="btn-test-connection"
                >
                  Test Connection
                </EuiButton>
              </EuiToolTip>
            )}
          </EuiFlexItem>

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
            onOpen={handleCheckConnectToInstance}
            onClone={handleCloneDatabase}
            onCloneBack={handleBackCloneDatabase}
            onApplyChanges={handleChangeDatabaseAlias}
          />
        </div>
      )}
      <div className="getStartedForm" ref={formRef}>
        {!isEditMode && instanceType === InstanceType.Standalone && (
          <>
            <MessageStandalone />
            <br />
          </>
        )}
        {!isEditMode && instanceType === InstanceType.Sentinel && (
          <>
            <MessageSentinel />
            <br />
          </>
        )}
        {!isEditMode && (
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
              isCloneMode={isCloneMode}
              isEditMode={isEditMode}
              connectionType={connectionType}
              instanceType={instanceType}
              onHostNamePaste={onHostNamePaste}
            />
            {instanceType !== InstanceType.Sentinel && (
              <DbIndex
                formik={formik}
                flexItemClassName={flexItemClassName}
                flexGroupClassName={flexGroupClassName}
              />
            )}
            {instanceType !== InstanceType.Sentinel && (
              <DbCompressor
                formik={formik}
                flexItemClassName={flexItemClassName}
                flexGroupClassName={flexGroupClassName}
              />
            )}
            <TlsDetails
              formik={formik}
              flexItemClassName={flexItemClassName}
              flexGroupClassName={flexGroupClassName}
              certificates={certificates}
              caCertificates={caCertificates}
            />
            {instanceType !== InstanceType.Sentinel && buildType !== BuildType.RedisStack && (
              <SSHDetails
                formik={formik}
                flexItemClassName={flexItemClassName}
                flexGroupClassName={flexGroupClassName}
              />
            )}
          </EuiForm>
        )}
        {(isEditMode || isCloneMode) && connectionType !== ConnectionType.Sentinel && (
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
                isCloneMode={isCloneMode}
                isEditMode={isEditMode}
                connectionType={connectionType}
                instanceType={instanceType}
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
                      isCloneMode={isCloneMode}
                      isEditMode={isEditMode}
                      connectionType={connectionType}
                      instanceType={instanceType}
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
                      isCloneMode={isCloneMode}
                      isEditMode={isEditMode}
                      connectionType={connectionType}
                      instanceType={instanceType}
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

export default AddStandaloneForm
