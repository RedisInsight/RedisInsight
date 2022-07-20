import React, { ChangeEvent, useRef, useEffect, useState } from 'react'
import {
  EuiButton,
  EuiButtonIcon,
  EuiCheckbox,
  EuiCollapsibleNavGroup,
  EuiFieldNumber,
  EuiFieldPassword,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiFormRow,
  EuiIcon,
  EuiListGroup,
  EuiListGroupItem,
  EuiSuperSelect,
  EuiSuperSelectOption,
  EuiText,
  EuiTextArea,
  EuiTextColor,
  EuiToolTip,
  htmlIdGenerator,
  EuiLink,
  keys,
  EuiCallOut,
} from '@elastic/eui'
import { capitalize, isEmpty, pick } from 'lodash'
import ReactDOM from 'react-dom'
import { useHistory } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { FormikErrors, useFormik } from 'formik'
import cx from 'classnames'
import {
  MAX_PORT_NUMBER,
  validateNumber,
  validateCertName,
  validateField,
  validatePortNumber,
} from 'uiSrc/utils/validations'
import {
  ConnectionType,
  Instance,
  InstanceType,
} from 'uiSrc/slices/interfaces'
import {
  changeInstanceAliasAction,
  checkConnectToInstanceAction,
  resetInstanceUpdateAction,
  setConnectedInstanceId,
} from 'uiSrc/slices/instances/instances'
import { handlePasteHostName } from 'uiSrc/utils'
import { APPLICATION_NAME, PageNames, Pages } from 'uiSrc/constants'
import { useResizableFormField } from 'uiSrc/services'
import validationErrors from 'uiSrc/constants/validationErrors'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { resetKeys } from 'uiSrc/slices/browser/keys'
import { appContextSelector, setAppContextInitialState } from 'uiSrc/slices/app/context'
import DatabaseAlias from 'uiSrc/pages/home/components/DatabaseAlias'
import { DatabaseListModules } from 'uiSrc/components'
import { getRedisModulesSummary } from 'apiSrc/utils/redis-modules-summary'
import {
  LoadingInstanceText,
  SubmitBtnText,
  TitleInstanceText,
} from '../InstanceFormWrapper'
import styles from './styles.module.scss'

export const ADD_NEW_CA_CERT = 'ADD_NEW_CA_CERT'
export const NO_CA_CERT = 'NO_CA_CERT'
export const ADD_NEW = 'ADD_NEW'

export interface DbConnectionInfo extends Instance {
  port: string;
  tlsClientAuthRequired?: boolean;
  certificates?: { id: number; name: string }[];
  selectedTlsClientCertId?: string | 'ADD_NEW' | undefined;
  newTlsCertPairName?: string;
  newTlsClientCert?: string;
  newTlsClientKey?: string;
  servername?: string;
  verifyServerTlsCert?: boolean;
  caCertificates?: { name: string; id: string }[];
  selectedCaCertName: string | typeof ADD_NEW_CA_CERT | typeof NO_CA_CERT;
  newCaCertName?: string;
  newCaCert?: string;
  username?: string;
  password?: string;
  showDb?: boolean;
  sni?: boolean;
  sentinelMasterUsername?: string;
  sentinelMasterPassword?: string;
}

export interface Props {
  width: number;
  isResizablePanel?: boolean;
  formFields: DbConnectionInfo;
  submitButtonText?: SubmitBtnText;
  titleText?: TitleInstanceText;
  loading: boolean;
  instanceType: InstanceType;
  loadingMsg: LoadingInstanceText;
  isEditMode: boolean;
  initialValues: DbConnectionInfo;
  onFormFieldChanged: <K extends keyof DbConnectionInfo>(
    fornField: K,
    value: DbConnectionInfo[K]
  ) => void;
  onSubmit: (values: DbConnectionInfo) => void;
  updateEditingName: (name: string) => void;
  onHostNamePaste: (content: string) => boolean;
  onClose?: () => void;
  onAliasEdited?: (value: string) => void;
  setErrorMsgRef?: (instance: HTMLDivElement | null) => void;
}

interface ISubmitButton {
  onClick: () => void;
  text?: string;
  submitIsDisabled?: boolean;
}

const fieldDisplayNames: DbConnectionInfo = {
  port: 'Port',
  host: 'Host',
  name: 'Database alias',
  selectedCaCertName: 'CA Certificate',
  newCaCertName: 'CA Certificate Name',
  newCaCert: 'CA certificate',
  newTlsCertPairName: 'Client Certificate Name',
  newTlsClientCert: 'Client Certificate',
  newTlsClientKey: 'Private Key',
  servername: 'Server Name',
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

const AddStandaloneForm = (props: Props) => {
  const {
    formFields: {
      id,
      host,
      name = '',
      port,
      tls,
      db = null,
      nameFromProvider,
      sentinelMaster,
      connectionType,
      endpoints = null,
      tlsClientAuthRequired,
      certificates,
      selectedTlsClientCertId = '',
      verifyServerTlsCert,
      caCertificates,
      selectedCaCertName,
      username,
      password,
      modules,
      sentinelMasterPassword,
      sentinelMasterUsername,
      isRediStack,
      servername,
      provider,
    },
    initialValues: initialValuesProp,
    width,
    onClose,
    onSubmit,
    onHostNamePaste,
    submitButtonText,
    instanceType,
    loading,
    isEditMode,
    onAliasEdited,
  } = props

  const { contextInstanceId, lastPage } = useSelector(appContextSelector)

  const [initialValues, setInitialValues] = useState({
    host,
    port: port?.toString(),
    name,
    username,
    password,
    tls,
    db,
    modules,
    showDb: !!db,
    sni: !!servername,
    newCaCert: '',
    newCaCertName: '',
    selectedCaCertName,
    tlsClientAuthRequired,
    verifyServerTlsCert,
    newTlsCertPairName: '',
    selectedTlsClientCertId,
    newTlsClientCert: '',
    newTlsClientKey: '',
    sentinelMasterUsername,
    sentinelMasterPassword,
  })

  const [errors, setErrors] = useState<FormikErrors<DbConnectionInfo>>(
    getInitFieldsDisplayNames({ host, port, name, instanceType })
  )

  useEffect(() => {
    const values = {
      ...initialValues,
      ...initialValuesProp,
    }

    setInitialValues(values)
    formik.validateForm(values)
  }, [initialValuesProp])

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

    setErrors(errs)
    return errs
  }

  const formik = useFormik({
    initialValues,
    validate,
    enableReinitialize: true,
    onSubmit: (values) => {
      onSubmit(values)
    },
  })

  const [flexGroupClassName, flexItemClassName] = useResizableFormField(
    formRef,
    width
  )

  const onKeyDown = (event: KeyboardEvent) => {
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

  const optionsCertsCA: EuiSuperSelectOption<string>[] = [
    {
      value: NO_CA_CERT,
      inputDisplay: 'No CA Certificate',
    },
    {
      value: ADD_NEW_CA_CERT,
      inputDisplay: 'Add new CA certificate',
    },
  ]

  caCertificates?.forEach((cert) => {
    optionsCertsCA.push({
      value: cert.id,
      inputDisplay: cert.name,
    })
  })

  const optionsCertsClient: EuiSuperSelectOption<string>[] = [
    {
      value: 'ADD_NEW',
      inputDisplay: 'Add new certificate',
    },
  ]

  certificates?.forEach((cert) => {
    optionsCertsClient.push({
      value: `${cert.id}`,
      inputDisplay: cert.name,
    })
  })

  const handleCopy = (text = '') => {
    navigator.clipboard.writeText(text)
  }

  const handleCheckConnectToInstance = () => {
    const modulesSummary = getRedisModulesSummary(modules);
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

  const handleChangeDbIndexCheckbox = (e: ChangeEvent<HTMLInputElement>): void => {
    const isChecked = e.target.checked
    if (!isChecked) {
      // Reset db field to initial value
      formik.setFieldValue('db', null)
    }
    formik.handleChange(e)
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

  const DbInfo = () => (
    <EuiListGroup className={styles.dbInfoGroup} flush>
      <EuiListGroupItem
        label={(
          <EuiText color="subdued" size="s">
            Connection Type:
            <EuiTextColor color="default" className={styles.dbInfoListValue}>
              {capitalize(connectionType)}
            </EuiTextColor>
          </EuiText>
        )}
      />

      {nameFromProvider && (
        <EuiListGroupItem
          label={(
            <EuiText color="subdued" size="s">
              Database Name from Provider:
              <EuiTextColor color="default" className={styles.dbInfoListValue}>
                {nameFromProvider}
              </EuiTextColor>
            </EuiText>
          )}
        />
      )}

      <EuiListGroupItem
        label={(
          <>
            {!!endpoints?.length && <AppendEndpoints />}
            <EuiText color="subdued" size="s">
              Host:
              <EuiTextColor color="default" className={styles.dbInfoListValue}>
                {host}
              </EuiTextColor>
            </EuiText>
          </>
        )}
      />

      <EuiListGroupItem
        label={(
          <EuiText color="subdued" size="s">
            Port:
            <EuiTextColor color="default" className={styles.dbInfoListValue}>
              {port}
            </EuiTextColor>
          </EuiText>
        )}
      />

      {!!db && (
        <EuiListGroupItem
          label={(
            <EuiText color="subdued" size="s">
              Database Index:
              <EuiTextColor color="default" className={styles.dbInfoListValue}>
                {db}
              </EuiTextColor>
            </EuiText>
            )}
        />
      )}

      {!!modules?.length && (
        <>
          <EuiListGroupItem
            className={styles.dbInfoModulesLabel}
            label={(
              <EuiText color="subdued" size="s">
                Modules:
              </EuiText>
            )}
          />
          <EuiTextColor color="default" className={cx(styles.dbInfoListValue, styles.dbInfoModules)}>
            <DatabaseListModules modules={modules} />
          </EuiTextColor>
        </>
      )}
    </EuiListGroup>
  )

  const DbInfoSentinel = () => (
    <EuiListGroup className={styles.dbInfoGroup} flush>
      <EuiListGroupItem
        label={(
          <EuiText color="subdued" size="s">
            Connection Type:
            <EuiTextColor color="default" className={styles.dbInfoListValue}>
              {capitalize(connectionType)}
            </EuiTextColor>
          </EuiText>
        )}
      />

      {sentinelMaster?.name && (
        <EuiListGroupItem
          label={(
            <EuiText color="subdued" size="s">
              Primary Group Name:
              <EuiTextColor color="default" className={styles.dbInfoListValue}>
                {sentinelMaster?.name}
              </EuiTextColor>
            </EuiText>
          )}
        />
      )}

      {nameFromProvider && (
        <EuiListGroupItem
          label={(
            <EuiText color="subdued" size="s">
              Database Name from Provider:
              <EuiTextColor color="default" className={styles.dbInfoListValue}>
                {nameFromProvider}
              </EuiTextColor>
            </EuiText>
          )}
        />
      )}
    </EuiListGroup>
  )

  const AppendHostName = () => (
    <EuiToolTip
      title={(
        <div>
          <p>
            <b>Pasting a connection URL auto fills the database details.</b>
          </p>
          <p style={{ margin: 0, paddingTop: '10px' }}>
            The following connection URLs are supported:
          </p>
        </div>
      )}
      className="homePage_tooltip"
      anchorClassName="inputAppendIcon"
      position="right"
      content={(
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
      )}
    >
      <EuiIcon type="iInCircle" style={{ cursor: 'pointer' }} />
    </EuiToolTip>
  )

  const AppendEndpoints = () => (
    <EuiToolTip
      title="Host:port"
      position="left"
      anchorClassName={styles.anchorEndpoints}
      content={(
        <ul className={styles.endpointsList}>
          {endpoints?.map(({ host: ephost, port: epport }) => (
            <li key={ephost + epport}>
              <EuiText>
                {ephost}
                :
                {epport}
                ;
              </EuiText>
            </li>
          ))}
        </ul>
      )}
    >
      <EuiIcon
        type="iInCircle"
        color="subdued"
        title=""
        style={{ cursor: 'pointer' }}
      />
    </EuiToolTip>
  )

  const DatabaseForm = () => (
    <>
      {!isEditMode && (
        <EuiFlexGroup className={flexGroupClassName}>
          <EuiFlexItem className={flexItemClassName}>
            <EuiFormRow label="Host*">
              <EuiFieldText
                autoFocus
                name="host"
                id="host"
                data-testid="host"
                color="secondary"
                maxLength={200}
                placeholder="Enter Hostname / IP address / Connection URL"
                value={formik.values.host ?? ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  formik.setFieldValue(
                    e.target.name,
                    validateField(e.target.value.trim())
                  )
                }}
                onPaste={(event: React.ClipboardEvent<HTMLInputElement>) =>
                  handlePasteHostName(onHostNamePaste, event)}
                append={<AppendHostName />}
              />
            </EuiFormRow>
          </EuiFlexItem>

          <EuiFlexItem className={flexItemClassName}>
            <EuiFormRow label="Port*" helpText="Should not exceed 65535.">
              <EuiFieldNumber
                name="port"
                id="port"
                data-testid="port"
                style={{ width: '100%' }}
                placeholder="Enter Port"
                value={formik.values.port ?? ''}
                maxLength={6}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  formik.setFieldValue(
                    e.target.name,
                    validatePortNumber(e.target.value.trim())
                  )
                }}
                type="text"
                min={0}
                max={MAX_PORT_NUMBER}
              />
            </EuiFormRow>
          </EuiFlexItem>
        </EuiFlexGroup>
      )}

      {!isEditMode && instanceType !== InstanceType.Sentinel && (
        <EuiFlexGroup className={flexGroupClassName}>
          <EuiFlexItem className={flexItemClassName}>
            <EuiFormRow label="Database Alias*">
              <EuiFieldText
                fullWidth
                name="name"
                id="name"
                data-testid="name"
                placeholder="Enter Database Alias"
                value={formik.values.name ?? ''}
                maxLength={500}
                onChange={formik.handleChange}
              />
            </EuiFormRow>
          </EuiFlexItem>
        </EuiFlexGroup>
      )}

      <EuiFlexGroup className={flexGroupClassName}>
        <EuiFlexItem className={flexItemClassName}>
          <EuiFormRow label="Username">
            <EuiFieldText
              name="username"
              id="username"
              data-testid="username"
              fullWidth
              maxLength={200}
              placeholder="Enter Username"
              value={formik.values.username ?? ''}
              onChange={formik.handleChange}
            />
          </EuiFormRow>
        </EuiFlexItem>

        <EuiFlexItem className={flexItemClassName}>
          <EuiFormRow label="Password">
            <EuiFieldPassword
              type="dual"
              name="password"
              id="password"
              data-testid="password"
              fullWidth
              className="passwordField"
              maxLength={200}
              placeholder="Enter Password"
              value={formik.values.password ?? ''}
              onChange={formik.handleChange}
              dualToggleProps={{ color: 'text' }}
              autoComplete="new-password"
            />
          </EuiFormRow>
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  )

  const DBIndex = () => (
    <>
      <EuiFlexGroup
        className={flexGroupClassName}
        responsive={false}
      >
        <EuiFlexItem
          grow={false}
          className={flexItemClassName}
        >
          <EuiFormRow>
            <EuiCheckbox
              id={`${htmlIdGenerator()()} over db`}
              name="showDb"
              label="Select Logical Database"
              checked={!!formik.values.showDb}
              onChange={handleChangeDbIndexCheckbox}
              data-testid="showDb"
            />
          </EuiFormRow>
        </EuiFlexItem>
      </EuiFlexGroup>

      {formik.values.showDb && (
        <EuiFlexGroup
          className={flexGroupClassName}
        >
          <EuiFlexItem className={flexItemClassName}>
            <EuiCallOut>
              <EuiText size="s" data-testid="db-index-message">
                When the database is added, you can select logical databases only in CLI.
                To work with other logical databases in Browser and Workbench,
                add another database with the same host and port,
                but a different database index.
              </EuiText>
            </EuiCallOut>
          </EuiFlexItem>
          <EuiFlexItem
            className={cx(
              flexItemClassName,
              styles.dbInput,
              { [styles.dbInputBig]: !flexItemClassName }
            )}
          >
            <EuiFormRow label="Database Index">
              <EuiFieldNumber
                name="db"
                id="db"
                data-testid="db"
                style={{ width: 120 }}
                placeholder="Enter Database Index"
                value={formik.values.db ?? '0'}
                maxLength={6}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  formik.setFieldValue(
                    e.target.name,
                    validateNumber(e.target.value.trim())
                  )
                }}
                type="text"
                min={0}
              />
            </EuiFormRow>
          </EuiFlexItem>
        </EuiFlexGroup>
      )}
    </>
  )

  const TlsDetails = () => (
    <>
      <EuiFlexGroup
        className={cx(flexGroupClassName, {
          [styles.tlsContainer]: !flexGroupClassName,
          [styles.tlsSniOpened]: formik.values.sni
        })}
        alignItems={!flexGroupClassName ? 'flexEnd' : undefined}
      >
        <EuiFlexItem
          style={{ width: '230px' }}
          grow={false}
          className={flexItemClassName}
        >
          <EuiCheckbox
            id={`${htmlIdGenerator()()} over ssl`}
            name="tls"
            label="Use TLS"
            checked={!!formik.values.tls}
            onChange={formik.handleChange}
            data-testid="tls"
          />
        </EuiFlexItem>

        {formik.values.tls && (
          <>
            <EuiFlexItem className={flexItemClassName}>
              <EuiCheckbox
                id={`${htmlIdGenerator()()} sni`}
                name="sni"
                label="Use SNI"
                checked={!!formik.values.sni}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  formik.setFieldValue(
                    'servername',
                    formik.values.servername ?? formik.values.host ?? ''
                  )
                  return formik.handleChange(e)
                }}
                data-testid="sni"
              />
            </EuiFlexItem>
            {formik.values.sni && (
              <EuiFlexItem className={flexItemClassName} style={{ flexBasis: '255px', marginTop: 0 }}>
                <EuiFormRow label="Server Name*" style={{ paddingTop: 0 }}>
                  <EuiFieldText
                    name="servername"
                    id="servername"
                    fullWidth
                    maxLength={200}
                    placeholder="Enter Server Name"
                    value={formik.values.servername ?? ''}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      formik.setFieldValue(
                        e.target.name,
                        validateField(e.target.value.trim())
                      )}
                    data-testid="sni-servername"
                  />
                </EuiFormRow>
              </EuiFlexItem>
            )}
            <EuiFlexItem className={cx(flexItemClassName, { [styles.fullWidth]: formik.values.sni })}>
              <EuiCheckbox
                id={`${htmlIdGenerator()()} verifyServerTlsCert`}
                name="verifyServerTlsCert"
                label="Verify TLS Certificate"
                checked={!!formik.values.verifyServerTlsCert}
                onChange={formik.handleChange}
                data-testid="verify-tls-cert"
              />
            </EuiFlexItem>
          </>
        )}
      </EuiFlexGroup>
      {formik.values.tls && (
        <div className="boxSection">
          <EuiFlexGroup className={flexGroupClassName}>
            <EuiFlexItem className={flexItemClassName}>
              <EuiFormRow
                label={`CA Certificate${
                  formik.values.verifyServerTlsCert ? '*' : ''
                }`}
              >
                <EuiSuperSelect
                  name="selectedCaCertName"
                  placeholder="Select CA certificate"
                  valueOfSelected={
                    formik.values.selectedCaCertName ?? NO_CA_CERT
                  }
                  options={optionsCertsCA}
                  onChange={(value) => {
                    formik.setFieldValue(
                      'selectedCaCertName',
                      value || NO_CA_CERT
                    )
                  }}
                  data-testid="select-ca-cert"
                />
              </EuiFormRow>
            </EuiFlexItem>

            {formik.values.tls
              && formik.values.selectedCaCertName === ADD_NEW_CA_CERT && (
                <EuiFlexItem className={flexItemClassName}>
                  <EuiFormRow label="Name*">
                    <EuiFieldText
                      name="newCaCertName"
                      id="newCaCertName"
                      fullWidth
                      maxLength={200}
                      placeholder="Enter CA Certificate Name"
                      value={formik.values.newCaCertName ?? ''}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        formik.setFieldValue(
                          e.target.name,
                          validateCertName(e.target.value)
                        )}
                      data-testid="qa-ca-cert"
                    />
                  </EuiFormRow>
                </EuiFlexItem>
            )}
          </EuiFlexGroup>

          {formik.values.tls
            && formik.values.selectedCaCertName === ADD_NEW_CA_CERT && (
              <EuiFlexGroup className={flexGroupClassName}>
                <EuiFlexItem className={flexItemClassName}>
                  <EuiFormRow label="Certificate*">
                    <EuiTextArea
                      name="newCaCert"
                      id="newCaCert"
                      className={styles.customScroll}
                      value={formik.values.newCaCert ?? ''}
                      onChange={formik.handleChange}
                      fullWidth
                      placeholder="Enter CA Certificate"
                      data-testid="new-ca-cert"
                    />
                  </EuiFormRow>
                </EuiFlexItem>
              </EuiFlexGroup>
          )}
        </div>
      )}
      {formik.values.tls && (
        <EuiFlexGroup gutterSize="none" style={{ margin: '20px 0 0' }}>
          <EuiFlexItem className={flexItemClassName}>
            <EuiCheckbox
              id={`${htmlIdGenerator()()} is_tls_client_auth_required`}
              name="tlsClientAuthRequired"
              label="Requires TLS Client Authentication"
              checked={!!formik.values.tlsClientAuthRequired}
              onChange={formik.handleChange}
              data-testid="tls-required-checkbox"
            />
          </EuiFlexItem>
        </EuiFlexGroup>
      )}
      {formik.values.tls && formik.values.tlsClientAuthRequired && (
        <div className="boxSection" style={{ marginTop: 15 }}>
          <EuiFlexGroup className={flexGroupClassName}>
            <EuiFlexItem className={flexItemClassName}>
              <EuiFormRow label="Client Certificate*">
                <EuiSuperSelect
                  placeholder="Select certificate"
                  valueOfSelected={formik.values.selectedTlsClientCertId}
                  options={optionsCertsClient}
                  onChange={(value) => {
                    formik.setFieldValue('selectedTlsClientCertId', value)
                  }}
                  data-testid="select-cert"
                />
              </EuiFormRow>
            </EuiFlexItem>

            {formik.values.tls
              && formik.values.tlsClientAuthRequired
              && formik.values.selectedTlsClientCertId === 'ADD_NEW' && (
                <EuiFlexItem className={flexItemClassName}>
                  <EuiFormRow label="Name*">
                    <EuiFieldText
                      name="newTlsCertPairName"
                      id="newTlsCertPairName"
                      fullWidth
                      maxLength={200}
                      placeholder="Enter Client Certificate Name"
                      value={formik.values.newTlsCertPairName ?? ''}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        formik.setFieldValue(
                          e.target.name,
                          validateCertName(e.target.value)
                        )}
                      data-testid="new-tsl-cert-pair-name"
                    />
                  </EuiFormRow>
                </EuiFlexItem>
            )}
          </EuiFlexGroup>

          {formik.values.tls
            && formik.values.tlsClientAuthRequired
            && formik.values.selectedTlsClientCertId === 'ADD_NEW' && (
              <>
                <EuiFlexGroup className={flexGroupClassName}>
                  <EuiFlexItem
                    style={{ width: '100%' }}
                    className={flexItemClassName}
                  >
                    <EuiFormRow label="Certificate*">
                      <EuiTextArea
                        name="newTlsClientCert"
                        id="newTlsClientCert"
                        className={styles.customScroll}
                        value={formik.values.newTlsClientCert}
                        onChange={formik.handleChange}
                        draggable={false}
                        fullWidth
                        placeholder="Enter Client Certificate"
                        data-testid="new-tls-client-cert"
                      />
                    </EuiFormRow>
                  </EuiFlexItem>
                </EuiFlexGroup>

                <EuiFlexGroup className={flexGroupClassName}>
                  <EuiFlexItem
                    style={{ width: '100%' }}
                    className={flexItemClassName}
                  >
                    <EuiFormRow label="Private Key*">
                      <EuiTextArea
                        placeholder="Enter Private Key"
                        name="newTlsClientKey"
                        id="newTlsClientKey"
                        className={styles.customScroll}
                        value={formik.values.newTlsClientKey}
                        onChange={formik.handleChange}
                        fullWidth
                        data-testid="new-tls-client-cert-key"
                      />
                    </EuiFormRow>
                  </EuiFlexItem>
                </EuiFlexGroup>
              </>
          )}
        </div>
      )}
    </>
  )

  const SentinelMasterDatabase = () => (
    <>
      {!!db && (
        <EuiText color="subdued" className={styles.sentinelCollapsedField}>
          Database Index:
          <span style={{ paddingLeft: 5 }}>
            <EuiTextColor>{db}</EuiTextColor>
          </span>
        </EuiText>
      )}
      <EuiFlexGroup className={flexGroupClassName}>
        <EuiFlexItem className={flexItemClassName}>
          <EuiFormRow label="Username">
            <EuiFieldText
              name="sentinelMasterUsername"
              id="sentinelMasterUsername"
              fullWidth
              maxLength={200}
              placeholder="Enter Username"
              value={formik.values.sentinelMasterUsername ?? ''}
              onChange={formik.handleChange}
              data-testid="sentinel-mater-username"
            />
          </EuiFormRow>
        </EuiFlexItem>

        <EuiFlexItem className={flexItemClassName}>
          <EuiFormRow label="Password">
            <EuiFieldPassword
              type="dual"
              name="sentinelMasterPassword"
              id="sentinelMasterPassword"
              data-testid="sentinelMasterPassword"
              fullWidth
              className="passwordField"
              maxLength={200}
              placeholder="Enter Password"
              value={formik.values.sentinelMasterPassword ?? ''}
              onChange={formik.handleChange}
              dualToggleProps={{ color: 'text' }}
              autoComplete="new-password"
            />
          </EuiFormRow>
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  )

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
        className="btn-add"
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
        <div className="footerAddDatabase">
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
        </div>,
        footerEl
      )
    }
    return null
  }

  const SentinelHostPort = () => (
    <EuiText color="subdued" className={styles.sentinelCollapsedField}>
      Host:Port:
      <div className={styles.hostPort}>
        <EuiTextColor>{`${host}:${port}`}</EuiTextColor>
        <EuiToolTip
          position="right"
          content="Copy"
          anchorClassName="copyHostPortTooltip"
        >
          <EuiButtonIcon
            iconType="copy"
            aria-label="Copy host:port"
            className={styles.copyHostPortBtn}
            onClick={() => handleCopy(`${host}:${port}`)}
          />
        </EuiToolTip>
      </div>
    </EuiText>
  )

  const MessageStandalone = () => (
    <EuiText color="subdued" size="s" className={styles.message} data-testid="summary">
      You can manually add your Redis databases. Enter Host and Port of your
      Redis database to add it to
      {' '}
      {APPLICATION_NAME}
      . &nbsp;
      <EuiLink
        color="text"
        href="https://docs.redis.com/latest/ri/using-redisinsight/add-instance/"
        className={styles.link}
        external={false}
        target="_blank"
      >
        Learn more here.
      </EuiLink>
    </EuiText>
  )

  const MessageSentinel = () => (
    <EuiText color="subdued" size="s" className={styles.message} data-testid="summary">
      You can automatically discover and add primary groups from your Redis
      Sentinel. Enter Host and Port of your Redis Sentinel to automatically
      discover your primary groups and add them to
      {' '}
      {APPLICATION_NAME}
      . &nbsp;
      <EuiLink
        color="text"
        href="https://redis.io/topics/sentinel"
        className={styles.link}
        external={false}
        target="_blank"
      >
        Learn more here.
      </EuiLink>
    </EuiText>
  )

  return (
    <div className="relative">
      {isEditMode && name && (
        <div className="fluid" style={{ marginBottom: 15 }}>
          <DatabaseAlias
            isRediStack={isRediStack}
            alias={name}
            database={db}
            isLoading={loading}
            onOpen={handleCheckConnectToInstance}
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
            {DatabaseForm()}
            { instanceType !== InstanceType.Sentinel && DBIndex() }
            {TlsDetails()}
          </EuiForm>
        )}
        {isEditMode && connectionType !== ConnectionType.Sentinel && (
          <>
            <DbInfo />
            <EuiForm
              component="form"
              onSubmit={formik.handleSubmit}
              data-testid="form"
              onKeyDown={onKeyDown}
            >
              {DatabaseForm()}
              {TlsDetails()}
            </EuiForm>
          </>
        )}
        {isEditMode && connectionType === ConnectionType.Sentinel && (
          <>
            <DbInfoSentinel />
            <EuiForm
              component="form"
              onSubmit={formik.handleSubmit}
              data-testid="form"
              onKeyDown={onKeyDown}
            >
              <EuiCollapsibleNavGroup
                title="Database"
                isCollapsible
                initialIsOpen={false}
              >
                {SentinelMasterDatabase()}
              </EuiCollapsibleNavGroup>
              <EuiCollapsibleNavGroup
                title="Sentinel"
                isCollapsible
                initialIsOpen={false}
              >
                {SentinelHostPort()}
                {DatabaseForm()}
              </EuiCollapsibleNavGroup>
              <EuiCollapsibleNavGroup
                title="TLS Details"
                isCollapsible
                initialIsOpen={false}
              >
                {TlsDetails()}
              </EuiCollapsibleNavGroup>
            </EuiForm>
          </>
        )}
      </div>
      <Footer />
    </div>
  )
}

AddStandaloneForm.defaultProps = {
  isResizablePanel: false,
  submitButtonText: '',
  titleText: '',
  connectionTypeText: '',
  setErrorMsgRef: () => {},
}

export default AddStandaloneForm
