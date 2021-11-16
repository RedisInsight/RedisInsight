/* eslint-disable no-nested-ternary */
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ConnectionString } from 'connection-string'
import { useHistory } from 'react-router'
import { pick } from 'lodash'

import {
  createInstanceStandaloneAction,
  updateInstanceAction,
  instancesSelector,
} from 'uiSrc/slices/instances'
import {
  clientCertsSelector,
  fetchClientCerts,
} from 'uiSrc/slices/clientCerts'
import { Nullable, removeEmpty } from 'uiSrc/utils'
import {
  ConnectionType,
  Instance,
  InstanceType,
} from 'uiSrc/slices/interfaces'
import { localStorageService } from 'uiSrc/services'
import { caCertsSelector, fetchCaCerts } from 'uiSrc/slices/caCerts'
import { DbType, BrowserStorageItem, REDIS_URI_SCHEMES, Pages } from 'uiSrc/constants'
import {
  fetchMastersSentinelAction,
  sentinelSelector,
} from 'uiSrc/slices/sentinel'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import InstanceForm, {
  ADD_NEW,
  ADD_NEW_CA_CERT,
  NO_CA_CERT,
} from './InstanceForm/InstanceForm'

export interface Props {
  width: number;
  isResizablePanel?: boolean;
  instanceType: InstanceType;
  editMode: boolean;
  editedInstance: Nullable<Instance>;
  onClose: () => void;
  onDbAdded: () => void;
}

export enum SubmitBtnText {
  AddInstance = 'Add Redis Database',
  EditInstance = 'Apply changes',
  ConnectToSentinel = 'Discover database',
}

export enum LoadingInstanceText {
  AddInstance = 'Adding database...',
  EditInstance = 'Editing database...',
}

export enum TitleInstanceText {
  AddInstance = 'Add Redis Database',
  EditInstance = 'Edit Redis Database',
}

const getInitialValues = (editedInstance: Nullable<Instance>) => ({
  host: editedInstance?.host ?? '',
  port: editedInstance?.port?.toString() ?? '',
  name: editedInstance?.name ?? '',
  username: editedInstance?.username ?? '',
  password: editedInstance?.password ?? '',
  tls: !!editedInstance?.tls ?? false,
})

const InstanceFormWrapper = (props: Props) => {
  const {
    editMode,
    width,
    instanceType,
    isResizablePanel = false,
    onClose,
    onDbAdded,
    editedInstance,
  } = props
  const [initialValues, setInitialValues] = useState(getInitialValues(editedInstance))

  const { host, port, name, username, password, tls } = initialValues

  const { loadingChanging: loadingStandalone } = useSelector(instancesSelector)
  const { loading: loadingSentinel } = useSelector(sentinelSelector)
  const { data: caCertificates } = useSelector(caCertsSelector)
  const { data: certificates } = useSelector(clientCertsSelector)

  const tlsClientAuthRequired = !!editedInstance?.tls?.clientCertPairId ?? false
  const selectedTlsClientCertId = editedInstance?.tls?.clientCertPairId ?? ADD_NEW
  const verifyServerTlsCert = editedInstance?.tls?.verifyServerCert ?? true
  const selectedCaCertName = editedInstance?.tls?.caCertId ?? NO_CA_CERT
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
  }, [editedInstance])

  const onMastersSentinelFetched = () => {
    history.push(Pages.sentinelDatabases)
  }

  const handleSubmitInstance = (payload: any) => {
    if (instanceType === InstanceType.Sentinel) {
      sendEventTelemetry({
        event: TelemetryEvent.CONFIG_DATABASES_REDIS_SENTINEL_AUTODISCOVERY_SUBMITTED
      })

      delete payload.name
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
  const handleEditInstance = (payload: any) => {
    dispatch(updateInstanceAction(payload))
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
    const instance = pick(editedInstance, ...requiredFields)
    dispatch(updateInstanceAction({ ...instance, name }))
  }

  const handleClose = () => {
    onClose()
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

  const editInstance = (tlsSettings, values) => {
    const {
      name,
      host,
      port,
      username,
      password,
      sentinelMasterUsername,
      sentinelMasterPassword,
    } = values

    const db = {
      id: editedInstance?.id,
      name,
      host,
      port,
      username,
      password,
    }

    const {
      useTls,
      verifyServerCert,
      caCert,
      clientAuth,
      clientCertificateKeyPair,
    } = tlsSettings

    if (useTls) {
      db.tls = {}

      db.tls.verifyServerCert = !!verifyServerCert

      if (typeof caCert?.new !== 'undefined') {
        db.tls.newCaCert = {
          name: caCert?.new.name,
          cert: caCert?.new.cert,
        }
      }
      if (typeof caCert?.name !== 'undefined') {
        db.tls.caCertId = caCert?.name
      }

      if (clientAuth) {
        if (typeof clientCertificateKeyPair.new !== 'undefined') {
          db.tls.newClientCertPair = {
            name: clientCertificateKeyPair.new.name,
            cert: clientCertificateKeyPair.new.cert,
            key: clientCertificateKeyPair.new.key,
          }
        }

        if (typeof clientCertificateKeyPair.id !== 'undefined') {
          db.tls.clientCertPairId = clientCertificateKeyPair.id
        }
      }
    }

    if (connectionType === ConnectionType.Sentinel) {
      db.sentinelMaster = {}
      db.sentinelMaster.name = masterName
      db.sentinelMaster.username = sentinelMasterUsername
      db.sentinelMaster.password = sentinelMasterPassword
    }

    handleEditInstance(removeEmpty(db))
  }

  const addInstance = (tlsSettings, values) => {
    const { name, host, port, username, password, db } = values
    const database = {
      name,
      host,
      port,
      db,
      username,
      password,
    }

    const {
      useTls,
      verifyServerCert,
      caCert,
      clientAuth,
      clientCertificateKeyPair,
    } = tlsSettings

    if (useTls) {
      database.tls = {}

      database.tls.verifyServerCert = !!verifyServerCert
      if (typeof caCert?.new !== 'undefined') {
        database.tls.newCaCert = {
          name: caCert?.new.name,
          cert: caCert?.new.cert,
        }
      }
      if (typeof caCert?.name !== 'undefined') {
        database.tls.caCertId = caCert?.name
      }

      if (clientAuth) {
        if (typeof clientCertificateKeyPair.new !== 'undefined') {
          database.tls.newClientCertPair = {
            name: clientCertificateKeyPair.new.name,
            cert: clientCertificateKeyPair.new.cert,
            key: clientCertificateKeyPair.new.key,
          }
        }

        if (typeof clientCertificateKeyPair.id !== 'undefined') {
          database.tls.clientCertPairId = clientCertificateKeyPair.id
        }
      }
    }

    handleSubmitInstance(removeEmpty(database))

    const instancesCount: number = JSON.parse(
      localStorageService.get(BrowserStorageItem.instancesCount) || `${0}`
    )
    localStorageService.set(
      BrowserStorageItem.instancesCount,
      instancesCount + 1
    )
    onDbAdded()
  }

  const handleConnectionFormSubmit = (values) => {
    const {
      newCaCert,
      tls,
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
      verifyServerCert: verifyServerTlsCert,
      caCert:
        !tls || selectedCaCertName === NO_CA_CERT
          ? undefined
          : selectedCaCertName === ADD_NEW_CA_CERT
            ? {
              new: {
                name: newCaCertName,
                cert: newCaCert,
              },
            }
            : {
              name: selectedCaCertName,
            },
      clientAuth: tls && tlsClientAuthRequired,
      clientCertificateKeyPair: !tls
        ? undefined
        : typeof selectedTlsClientCertId === 'string'
          && tlsClientAuthRequired
          && selectedTlsClientCertId !== ADD_NEW
          ? { id: selectedTlsClientCertId }
          : selectedTlsClientCertId === ADD_NEW && tlsClientAuthRequired
            ? {
              new: {
                name: newTlsCertPairName,
                cert: newTlsClientCert,
                key: newTlsClientKey,
              },
            }
            : undefined,
    }

    if (editMode) {
      editInstance(tlsSettings, values)
    } else {
      addInstance(tlsSettings, values)
    }
  }

  const connectionFormData = {
    ...editedInstance,
    name,
    host,
    port,
    tls,
    username,
    password,
    connectionType,
    tlsClientAuthRequired,
    certificates,
    selectedTlsClientCertId,
    caCertificates,
    verifyServerTlsCert,
    selectedCaCertName,
    sentinelMasterUsername,
    sentinelMasterPassword,
  }

  const getSubmitButtonText = () => {
    let text = SubmitBtnText.AddInstance
    if (instanceType === InstanceType.Sentinel) {
      text = SubmitBtnText.ConnectToSentinel
    }
    if (editMode) {
      text = SubmitBtnText.EditInstance
    }
    return text
  }

  return (
    <div>
      <InstanceForm
        width={width}
        isResizablePanel={isResizablePanel}
        formFields={connectionFormData}
        initialValues={initialValues}
        loading={loadingStandalone || loadingSentinel}
        instanceType={instanceType}
        loadingMsg={
          editMode
            ? LoadingInstanceText.EditInstance
            : LoadingInstanceText.AddInstance
        }
        submitButtonText={getSubmitButtonText()}
        titleText={
          editMode
            ? TitleInstanceText.EditInstance
            : TitleInstanceText.AddInstance
        }
        onSubmit={handleConnectionFormSubmit}
        onClose={handleClose}
        onHostNamePaste={autoFillFormDetails}
        isEditMode={editMode}
        updateEditingName={handleUpdateEditingName}
      />
    </div>
  )
}

export default InstanceFormWrapper
