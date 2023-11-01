import { pick, toNumber, toString, omit } from 'lodash'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router'

import {
  checkConnectToInstanceAction,
  createInstanceStandaloneAction,
  instancesSelector,
  testInstanceStandaloneAction,
  updateInstanceAction,
  cloneInstanceAction,
} from 'uiSrc/slices/instances/instances'
import { Nullable, removeEmpty, getFormUpdates, transformQueryParamsObject } from 'uiSrc/utils'
import { BuildType } from 'uiSrc/constants/env'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { caCertsSelector, fetchCaCerts } from 'uiSrc/slices/instances/caCerts'
import { ConnectionType, Instance, InstanceType } from 'uiSrc/slices/interfaces'
import { DbType, Pages } from 'uiSrc/constants'
import { clientCertsSelector, fetchClientCerts, } from 'uiSrc/slices/instances/clientCerts'
import { appInfoSelector } from 'uiSrc/slices/app/info'
import { UrlHandlingActions } from 'uiSrc/slices/interfaces/urlHandling'
import { appRedirectionSelector, setUrlHandlingInitialState } from 'uiSrc/slices/app/url-handling'
import { getRedirectionPage } from 'uiSrc/utils/routing'
import { DbConnectionInfo } from 'uiSrc/pages/home/interfaces'
import { applyTlSDatabase, applySSHDatabase, autoFillFormDetails } from 'uiSrc/pages/home/utils'
import { ADD_NEW, ADD_NEW_CA_CERT, DEFAULT_TIMEOUT, NO_CA_CERT, SshPassType, SubmitBtnText } from 'uiSrc/pages/home/constants'
import ManualConnectionForm from './ManualConnectionForm'

export interface Props {
  width: number
  editMode: boolean
  urlHandlingAction?: Nullable<UrlHandlingActions>
  initialValues?: Nullable<Record<string, any>>
  editedInstance: Nullable<Instance>
  onClose?: () => void
  onDbEdited?: () => void
  onAliasEdited?: (value: string) => void
}

export enum TitleDatabaseText {
  AddDatabase = 'Add Redis Database',
  EditDatabase = 'Edit Redis Database',
}

const getInitialValues = (editedInstance?: Nullable<Record<string, any>>) => ({
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
  servername: editedInstance?.tlsServername,
  sshPassType: editedInstance?.sshOptions
    ? (editedInstance.sshOptions.privateKey ? SshPassType.PrivateKey : SshPassType.Password)
    : SshPassType.Password
})

const ManualConnectionWrapper = (props: Props) => {
  const {
    editMode,
    width,
    onClose,
    onDbEdited,
    onAliasEdited,
    editedInstance,
    urlHandlingAction,
    initialValues: initialValuesProp
  } = props
  const [initialValues, setInitialValues] = useState(getInitialValues(editedInstance || initialValuesProp))
  const [isCloneMode, setIsCloneMode] = useState<boolean>(false)

  const { host, port, name, username, password, timeout, tls, ssh, sshPassType, servername } = initialValues

  const { loadingChanging: loadingStandalone } = useSelector(instancesSelector)
  const { data: caCertificates } = useSelector(caCertsSelector)
  const { data: certificates } = useSelector(clientCertsSelector)
  const { server } = useSelector(appInfoSelector)
  const { properties: urlHandlingProperties } = useSelector(appRedirectionSelector)

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
    (editedInstance || initialValuesProp) && setInitialValues({
      ...initialValues,
      ...getInitialValues(editedInstance || initialValuesProp)
    })
    setIsCloneMode(false)
  }, [editedInstance, initialValuesProp])

  const onMastersSentinelFetched = () => {
    history.push(Pages.sentinelDatabases)
  }

  const handleSuccessConnectWithRedirect = (id: string) => {
    const { redirect } = urlHandlingProperties
    dispatch(setUrlHandlingInitialState())

    dispatch(checkConnectToInstanceAction(id, (id) => {
      if (redirect) {
        const pageToRedirect = getRedirectionPage(redirect, id)

        if (pageToRedirect) {
          history.push(pageToRedirect)
        }
      }
    }))
  }

  const handleSubmitDatabase = (payload: any) => {
    if (isCloneMode && connectionType === ConnectionType.Sentinel) {
      dispatch(createInstanceStandaloneAction(payload))
      return
    }

    sendEventTelemetry({
      event: TelemetryEvent.CONFIG_DATABASES_MANUALLY_SUBMITTED
    })

    if (urlHandlingAction === UrlHandlingActions.Connect) {
      const cloudDetails = transformQueryParamsObject(
        pick(
          urlHandlingProperties,
          ['cloudId', 'subscriptionType', 'planMemoryLimit', 'memoryLimitMeasurementUnit', 'free']
        )
      )

      const db = { ...payload }
      if (cloudDetails?.cloudId) {
        db.cloudDetails = cloudDetails
      }

      dispatch(createInstanceStandaloneAction(db, undefined, handleSuccessConnectWithRedirect))
      return
    }

    dispatch(createInstanceStandaloneAction(payload, onMastersSentinelFetched))
  }
  const handleEditDatabase = (payload: any) => {
    dispatch(updateInstanceAction(payload, onDbEdited))
  }

  const handleCloneDatabase = (payload: any) => {
    dispatch(cloneInstanceAction(payload))
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
      compressor,
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
      compressor,
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

    if (editMode && editedInstance) {
      dispatch(testInstanceStandaloneAction({
        ...getFormUpdates(database, editedInstance),
        id: editedInstance.id,
      }))
    } else {
      dispatch(testInstanceStandaloneAction(removeEmpty(database)))
    }
  }

  const editDatabase = (tlsSettings: any, values: DbConnectionInfo, isCloneMode: boolean) => {
    const {
      name,
      host,
      port,
      db,
      username,
      password,
      timeout,
      compressor,
      sentinelMasterUsername,
      sentinelMasterPassword,
    } = values

    const database: any = {
      id: editedInstance?.id,
      name,
      host,
      port: +port,
      db: +(db || 0),
      username,
      password,
      compressor,
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

    const payload = getFormUpdates(database, omit(editedInstance, ['id']))
    if (isCloneMode) {
      handleCloneDatabase(payload)
    } else {
      handleEditDatabase(payload)
    }
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
      compressor,
      sentinelMasterName,
      sentinelMasterUsername,
      sentinelMasterPassword,
    } = values
    const database: any = {
      name,
      host,
      port: +port,
      db: +(db || 0),
      compressor,
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

    if (editMode) {
      editDatabase(tlsSettings, values, isCloneMode)
    } else {
      addDatabase(tlsSettings, values)
    }
  }

  const handleOnClose = () => {
    dispatch(setUrlHandlingInitialState())

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
    sshPassType,
    servername,
  }

  const getSubmitButtonText = () => {
    if (isCloneMode) {
      return SubmitBtnText.CloneDatabase
    }
    if (editMode) {
      return SubmitBtnText.EditDatabase
    }
    return SubmitBtnText.AddDatabase
  }

  const handlePostHostName = (content: string): boolean => (
    autoFillFormDetails(content, initialValues, setInitialValues, InstanceType.Standalone)
  )

  return (
    <div>
      <ManualConnectionForm
        width={width}
        formFields={connectionFormData}
        initialValues={initialValues}
        loading={loadingStandalone}
        buildType={server?.buildType as BuildType}
        submitButtonText={getSubmitButtonText()}
        titleText={
          editMode
            ? TitleDatabaseText.EditDatabase
            : TitleDatabaseText.AddDatabase
        }
        onSubmit={handleConnectionFormSubmit}
        onTestConnection={handleTestConnectionDatabase}
        onClose={handleOnClose}
        onHostNamePaste={handlePostHostName}
        isEditMode={editMode}
        isCloneMode={isCloneMode}
        setIsCloneMode={setIsCloneMode}
        updateEditingName={handleUpdateEditingName}
        onAliasEdited={onAliasEdited}
      />
    </div>
  )
}

export default ManualConnectionWrapper
