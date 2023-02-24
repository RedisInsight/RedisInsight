/* eslint-disable no-nested-ternary */
import { ConnectionString } from 'connection-string'
import { isUndefined, pick, toNumber, toString } from 'lodash'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router'

import {
  createInstanceStandaloneAction,
  instancesSelector,
  updateInstanceAction,
  testInstanceStandaloneAction,
} from 'uiSrc/slices/instances/instances'
import {
  fetchMastersSentinelAction,
  sentinelSelector,
} from 'uiSrc/slices/instances/sentinel'
import { Nullable, removeEmpty } from 'uiSrc/utils'
import { localStorageService } from 'uiSrc/services'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { caCertsSelector, fetchCaCerts } from 'uiSrc/slices/instances/caCerts'
import { ConnectionType, Instance, InstanceType, } from 'uiSrc/slices/interfaces'
import { BrowserStorageItem, DbType, Pages, REDIS_URI_SCHEMES } from 'uiSrc/constants'
import { clientCertsSelector, fetchClientCerts, } from 'uiSrc/slices/instances/clientCerts'
import { appInfoSelector } from 'uiSrc/slices/app/info'

import InstanceForm from './InstanceForm'
import { DbConnectionInfo } from './InstanceForm/interfaces'
import { ADD_NEW, ADD_NEW_CA_CERT, DEFAULT_TIMEOUT, NO_CA_CERT, SshPassType } from './InstanceForm/constants'

export interface Props {
  width: number
  isResizablePanel?: boolean
  instanceType: InstanceType
  editMode: boolean
  editedInstance: Nullable<Instance>
  onClose?: () => void
  onDbEdited?: () => void
  onAliasEdited?: (value: string) => void
}

export enum SubmitBtnText {
  AddDatabase = 'Add Redis Database',
  EditDatabase = 'Apply changes',
  ConnectToSentinel = 'Discover database',
  CloneDatabase = 'Clone Database'
}

export enum LoadingDatabaseText {
  AddDatabase = 'Adding database...',
  EditDatabase = 'Editing database...',
}

export enum TitleDatabaseText {
  AddDatabase = 'Add Redis Database',
  EditDatabase = 'Edit Redis Database',
}

const getInitialValues = (editedInstance: Nullable<Instance>) => ({
  // undefined - to show default value, empty string - for existing db
  host: editedInstance?.host ?? (editedInstance ? '' : undefined),
  port: editedInstance?.port?.toString() ?? (editedInstance ? '' : undefined),
  name: editedInstance?.name ?? (editedInstance ? '' : undefined),
  username: editedInstance?.username ?? '',
  password: editedInstance?.password ?? '',
  timeout: editedInstance?.timeout
    ? toString(editedInstance?.timeout / 1_000)
    : (editedInstance ? '' : undefined),
  tls: !!editedInstance?.tls ?? false,
  ssh: !!editedInstance?.ssh ?? false,
  sshPassType: editedInstance?.sshOptions
    ? (editedInstance.sshOptions.privateKey ? SshPassType.PrivateKey : SshPassType.Password)
    : SshPassType.Password
})

const InstanceFormWrapper = (props: Props) => {
  const {
    editMode,
    width,
    instanceType,
    isResizablePanel = false,
    onClose,
    onDbEdited,
    onAliasEdited,
    editedInstance,
  } = props
  const [initialValues, setInitialValues] = useState(getInitialValues(editedInstance))
  const [isCloneMode, setIsCloneMode] = useState<boolean>(false)

  const { host, port, name, username, password, timeout, tls, ssh, sshPassType } = initialValues

  const { loadingChanging: loadingStandalone } = useSelector(instancesSelector)
  const { loading: loadingSentinel } = useSelector(sentinelSelector)
  const { data: caCertificates } = useSelector(caCertsSelector)
  const { data: certificates } = useSelector(clientCertsSelector)
  const { server } = useSelector(appInfoSelector)

  const tlsClientAuthRequired = !!editedInstance?.clientCert?.id ?? false
  const selectedTlsClientCertId = editedInstance?.clientCert?.id ?? ADD_NEW
  const verifyServerTlsCert = editedInstance?.verifyServerCert ?? false
  const selectedCaCertName = editedInstance?.caCert?.id ?? NO_CA_CERT
  const sentinelMasterUsername = editedInstance?.sentinelMaster?.username ?? ''
  const sentinelMasterPassword = editedInstance?.sentinelMaster?.password ?? ''

  const connectionType = editedInstance?.connectionType ?? DbType.STANDALONE
  const masterName = editedInstance?.sentinelMaster?.name

  const history = useHistory()
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchCaCerts())
    dispatch(fetchClientCerts())
  }, [])

  useEffect(() => {
    editedInstance && setInitialValues({
      ...initialValues,
      ...getInitialValues(editedInstance)
    })
    setIsCloneMode(false)
  }, [editedInstance])

  const onMastersSentinelFetched = () => {
    history.push(Pages.sentinelDatabases)
  }

  const handleSubmitDatabase = (payload: any) => {
    if (isCloneMode && connectionType === ConnectionType.Sentinel) {
      dispatch(createInstanceStandaloneAction(payload))
      return
    }

    if (instanceType === InstanceType.Sentinel) {
      sendEventTelemetry({
        event: TelemetryEvent.CONFIG_DATABASES_REDIS_SENTINEL_AUTODISCOVERY_SUBMITTED
      })

      delete payload.name
      delete payload.db
      dispatch(fetchMastersSentinelAction(payload, onMastersSentinelFetched))
    } else {
      sendEventTelemetry({
        event: TelemetryEvent.CONFIG_DATABASES_MANUALLY_SUBMITTED
      })

      dispatch(
        createInstanceStandaloneAction(payload, onMastersSentinelFetched)
      )
    }
  }
  const handleEditDatabase = (payload: any) => {
    dispatch(updateInstanceAction(payload, onDbEdited))
  }

  const handleUpdateEditingName = (name: string) => {
    const requiredFields = [
      'id',
      'host',
      'port',
      'username',
      'password',
      'tls',
      'sentinelMaster',
    ]
    const database = pick(editedInstance, ...requiredFields)
    dispatch(updateInstanceAction({ ...database, name }))
  }

  const handleTestConnectionDatabase = (values: DbConnectionInfo) => {
    sendEventTelemetry({
      event: TelemetryEvent.CONFIG_DATABASES_TEST_CONNECTION_CLICKED
    })
    const {
      name,
      host,
      port,
      username,
      password,
      db,
      timeout,
      sentinelMasterName,
      sentinelMasterUsername,
      sentinelMasterPassword,
      newCaCert,
      tls,
      sni,
      servername,
      newCaCertName,
      selectedCaCertName,
      tlsClientAuthRequired,
      verifyServerTlsCert,
      newTlsCertPairName,
      selectedTlsClientCertId,
      newTlsClientCert,
      newTlsClientKey,
    } = values

    const tlsSettings = {
      useTls: tls,
      servername: (sni && servername) || undefined,
      verifyServerCert: verifyServerTlsCert,
      caCert:
        !tls || selectedCaCertName === NO_CA_CERT
          ? undefined
          : selectedCaCertName === ADD_NEW_CA_CERT
            ? {
              new: {
                name: newCaCertName,
                certificate: newCaCert,
              },
            }
            : {
              name: selectedCaCertName,
            },
      clientAuth: tls && tlsClientAuthRequired,
      clientCert: !tls
        ? undefined
        : typeof selectedTlsClientCertId === 'string'
          && tlsClientAuthRequired
          && selectedTlsClientCertId !== ADD_NEW
          ? { id: selectedTlsClientCertId }
          : selectedTlsClientCertId === ADD_NEW && tlsClientAuthRequired
            ? {
              new: {
                name: newTlsCertPairName,
                certificate: newTlsClientCert,
                key: newTlsClientKey,
              },
            }
            : undefined,
    }

    const database: any = {
      name,
      host,
      port: +port,
      db: +(db || 0),
      username,
      password,
      timeout: timeout ? toNumber(timeout) * 1_000 : toNumber(DEFAULT_TIMEOUT),
    }

    // add tls & ssh for database (modifies database object)
    applyTlSDatabase(database, tlsSettings)
    applySSHDatabase(database, values)

    if (isCloneMode && connectionType === ConnectionType.Sentinel) {
      database.sentinelMaster = {
        name: sentinelMasterName,
        username: sentinelMasterUsername,
        password: sentinelMasterPassword,
      }
    }

    dispatch(testInstanceStandaloneAction(removeEmpty(database)))
  }

  const autoFillFormDetails = (content: string): boolean => {
    try {
      const details = new ConnectionString(content)

      /* If a protocol exists, it should be a redis protocol */
      if (details.protocol && !REDIS_URI_SCHEMES.includes(details.protocol)) return false
      /*
       * Auto fill logic:
       * 1) If the port is parsed, we are sure that the user has indeed copied a connection string.
       *    '172.18.0.2:12000'                => {host: '172,18.0.2', port: 12000}
       *    'redis-12000.cluster.local:12000' => {host: 'redis-12000.cluster.local', port: 12000}
       *    'lorem ipsum'                     => {host: undefined, port: undefined}
       * 2) If the port is `undefined` but a redis URI scheme is present as protocol, we follow
       *    the "Scheme semantics" as mentioned in the official URI schemes.
       *    i)  redis:// - https://www.iana.org/assignments/uri-schemes/prov/redis
       *    ii) rediss:// - https://www.iana.org/assignments/uri-schemes/prov/rediss
       */
      if (
        details.port !== undefined
        || REDIS_URI_SCHEMES.includes(details.protocol || '')
      ) {
        setInitialValues({
          name: details.host || name || 'localhost:6379',
          host: details.hostname || host || 'localhost',
          port: `${details.port || port || 9443}`,
          username: details.user || '',
          password: details.password || '',
          tls: details.protocol === 'rediss',
          ssh: false,
          sshPassType: SshPassType.Password
        })
        /*
         * auto fill was successfull so return true
         */
        return true
      }
    } catch (err) {
      /* The pasted content is not a connection URI so ignore. */
      return false
    }
    return false
  }

  const applyTlSDatabase = (database: any, tlsSettings: any) => {
    const { useTls, verifyServerCert, servername, caCert, clientAuth, clientCert } = tlsSettings
    if (!useTls) return

    database.tls = useTls
    database.tlsServername = servername
    database.verifyServerCert = !!verifyServerCert

    if (!isUndefined(caCert?.new)) {
      database.caCert = {
        name: caCert?.new.name,
        certificate: caCert?.new.certificate,
      }
    }

    if (!isUndefined(caCert?.name)) {
      database.caCert = { id: caCert?.name }
    }

    if (clientAuth) {
      if (!isUndefined(clientCert.new)) {
        database.clientCert = {
          name: clientCert.new.name,
          certificate: clientCert.new.certificate,
          key: clientCert.new.key,
        }
      }

      if (!isUndefined(clientCert.id)) {
        database.clientCert = { id: clientCert.id }
      }
    }
  }

  const applySSHDatabase = (database: any, values: DbConnectionInfo) => {
    const {
      ssh,
      sshPassType,
      sshHost,
      sshPort,
      sshPassword,
      sshUsername,
      sshPassphrase,
      sshPrivateKey,
    } = values

    if (ssh) {
      database.ssh = true
      database.sshOptions = {
        host: sshHost,
        port: +sshPort,
        username: sshUsername,
      }

      if (sshPassType === SshPassType.Password) {
        database.sshOptions.password = sshPassword
      }

      if (sshPassType === SshPassType.PrivateKey) {
        database.sshOptions.passphrase = sshPassphrase
        database.sshOptions.privateKey = sshPrivateKey
      }
    }
  }

  const editDatabase = (tlsSettings: any, values: DbConnectionInfo) => {
    const {
      name,
      host,
      port,
      username,
      password,
      timeout,
      sentinelMasterUsername,
      sentinelMasterPassword,
    } = values

    const database: any = {
      id: editedInstance?.id,
      name,
      host,
      port: +port,
      username,
      password,
      timeout: timeout ? toNumber(timeout) * 1_000 : toNumber(DEFAULT_TIMEOUT),
    }

    // add tls & ssh for database (modifies database object)
    applyTlSDatabase(database, tlsSettings)
    applySSHDatabase(database, values)

    if (connectionType === ConnectionType.Sentinel) {
      database.sentinelMaster = {}
      database.sentinelMaster.name = masterName
      database.sentinelMaster.username = sentinelMasterUsername
      database.sentinelMaster.password = sentinelMasterPassword
    }

    handleEditDatabase(removeEmpty(database))
  }

  const addDatabase = (tlsSettings: any, values: DbConnectionInfo) => {
    const {
      name,
      host,
      port,
      username,
      password,
      timeout,
      db,
      sentinelMasterName,
      sentinelMasterUsername,
      sentinelMasterPassword,
    } = values
    const database: any = {
      name,
      host,
      port: +port,
      db: +(db || 0),
      username,
      password,
      timeout: timeout ? toNumber(timeout) * 1_000 : toNumber(DEFAULT_TIMEOUT),
    }

    // add tls & ssh for database (modifies database object)
    applyTlSDatabase(database, tlsSettings)
    applySSHDatabase(database, values)

    if (isCloneMode && connectionType === ConnectionType.Sentinel) {
      database.sentinelMaster = {
        name: sentinelMasterName,
        username: sentinelMasterUsername,
        password: sentinelMasterPassword,
      }
    }

    handleSubmitDatabase(removeEmpty(database))

    const databasesCount: number = JSON.parse(
      localStorageService.get(BrowserStorageItem.instancesCount) || `${0}`
    )
    localStorageService.set(
      BrowserStorageItem.instancesCount,
      databasesCount + 1
    )
  }

  const handleConnectionFormSubmit = (values: DbConnectionInfo) => {
    const {
      newCaCert,
      tls,
      sni,
      servername,
      newCaCertName,
      selectedCaCertName,
      tlsClientAuthRequired,
      verifyServerTlsCert,
      newTlsCertPairName,
      selectedTlsClientCertId,
      newTlsClientCert,
      newTlsClientKey,
    } = values

    const tlsSettings = {
      useTls: tls,
      servername: (sni && servername) || undefined,
      verifyServerCert: verifyServerTlsCert,
      caCert:
        !tls || selectedCaCertName === NO_CA_CERT
          ? undefined
          : selectedCaCertName === ADD_NEW_CA_CERT
            ? {
              new: {
                name: newCaCertName,
                certificate: newCaCert,
              },
            }
            : {
              name: selectedCaCertName,
            },
      clientAuth: tls && tlsClientAuthRequired,
      clientCert: !tls
        ? undefined
        : typeof selectedTlsClientCertId === 'string'
          && tlsClientAuthRequired
          && selectedTlsClientCertId !== ADD_NEW
          ? { id: selectedTlsClientCertId }
          : selectedTlsClientCertId === ADD_NEW && tlsClientAuthRequired
            ? {
              new: {
                name: newTlsCertPairName,
                certificate: newTlsClientCert,
                key: newTlsClientKey,
              },
            }
            : undefined,
    }

    if (editMode && !isCloneMode) {
      editDatabase(tlsSettings, values)
    } else {
      addDatabase(tlsSettings, values)
    }
  }

  const handleOnClose = () => {
    if (isCloneMode) {
      sendEventTelemetry({
        event: TelemetryEvent.CONFIG_DATABASES_DATABASE_CLONE_CANCELLED,
        eventData: {
          databaseId: editedInstance?.id,
        }
      })
    }
    onClose?.()
  }

  const connectionFormData = {
    ...editedInstance,
    name,
    host,
    port,
    tls,
    username,
    password,
    timeout,
    connectionType,
    tlsClientAuthRequired,
    certificates,
    selectedTlsClientCertId,
    caCertificates,
    verifyServerTlsCert,
    selectedCaCertName,
    sentinelMasterUsername,
    sentinelMasterPassword,
    ssh,
    sshPassType
  }

  const getSubmitButtonText = () => {
    if (instanceType === InstanceType.Sentinel) {
      return SubmitBtnText.ConnectToSentinel
    }
    if (isCloneMode) {
      return SubmitBtnText.CloneDatabase
    }
    if (editMode) {
      return SubmitBtnText.EditDatabase
    }
    return SubmitBtnText.AddDatabase
  }

  return (
    <div>
      <InstanceForm
        width={width}
        isResizablePanel={isResizablePanel}
        formFields={connectionFormData}
        initialValues={initialValues}
        loading={loadingStandalone || loadingSentinel}
        buildType={server?.buildType}
        instanceType={instanceType}
        loadingMsg={
          editMode
            ? LoadingDatabaseText.EditDatabase
            : LoadingDatabaseText.AddDatabase
        }
        submitButtonText={getSubmitButtonText()}
        titleText={
          editMode
            ? TitleDatabaseText.EditDatabase
            : TitleDatabaseText.AddDatabase
        }
        onSubmit={handleConnectionFormSubmit}
        onTestConnection={handleTestConnectionDatabase}
        onClose={handleOnClose}
        onHostNamePaste={autoFillFormDetails}
        isEditMode={editMode}
        isCloneMode={isCloneMode}
        setIsCloneMode={setIsCloneMode}
        updateEditingName={handleUpdateEditingName}
        onAliasEdited={onAliasEdited}
      />
    </div>
  )
}

export default InstanceFormWrapper
