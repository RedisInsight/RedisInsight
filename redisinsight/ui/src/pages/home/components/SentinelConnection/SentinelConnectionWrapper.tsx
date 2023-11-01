import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router'

import { fetchMastersSentinelAction, sentinelSelector, } from 'uiSrc/slices/instances/sentinel'
import { removeEmpty } from 'uiSrc/utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { caCertsSelector, fetchCaCerts } from 'uiSrc/slices/instances/caCerts'
import { Pages } from 'uiSrc/constants'
import { clientCertsSelector, fetchClientCerts, } from 'uiSrc/slices/instances/clientCerts'

import { DbConnectionInfo } from 'uiSrc/pages/home/interfaces'
import { applyTlSDatabase, autoFillFormDetails } from 'uiSrc/pages/home/utils'
import { ADD_NEW, ADD_NEW_CA_CERT, NO_CA_CERT, SubmitBtnText } from 'uiSrc/pages/home/constants'
import { InstanceType } from 'uiSrc/slices/interfaces'
import SentinelConnectionForm from './SentinelConnectionForm'

export interface Props {
  width: number
  onClose?: () => void
}
const getDefaultHost = () => '127.0.0.1'
const getDefaultPort = () => '26379'

const INITIAL_VALUES = {
  host: getDefaultHost(),
  port: getDefaultPort(),
  username: '',
  password: '',
  tls: false,
  tlsClientAuthRequired: false,
  selectedTlsClientCertId: ADD_NEW,
  verifyServerTlsCert: false,
  selectedCaCertName: NO_CA_CERT,

}

const SentinelConnectionWrapper = (props: Props) => {
  const {
    width,
    onClose,
  } = props
  const [initialValues, setInitialValues] = useState(INITIAL_VALUES)

  const { loading } = useSelector(sentinelSelector)
  const { data: caCertificates } = useSelector(caCertsSelector)
  const { data: certificates } = useSelector(clientCertsSelector)

  const history = useHistory()
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchCaCerts())
    dispatch(fetchClientCerts())
  }, [])

  const onMastersSentinelFetched = () => {
    history.push(Pages.sentinelDatabases)
  }

  const handleSubmitDatabase = (payload: any) => {
    sendEventTelemetry({
      event: TelemetryEvent.CONFIG_DATABASES_REDIS_SENTINEL_AUTODISCOVERY_SUBMITTED
    })

    dispatch(fetchMastersSentinelAction(payload, onMastersSentinelFetched))
  }

  const addDatabase = (tlsSettings: any, values: DbConnectionInfo) => {
    const {
      host,
      port,
      username,
      password,
    } = values
    const database: any = {
      host,
      port: +port,
      username,
      password,
    }

    // add tls for database
    applyTlSDatabase(database, tlsSettings)
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

    addDatabase(tlsSettings, values)
  }

  const handlePostHostName = (content: string): boolean => (
    autoFillFormDetails(content, initialValues, setInitialValues, InstanceType.Sentinel)
  )

  return (
    <div>
      <SentinelConnectionForm
        width={width}
        initialValues={initialValues}
        loading={loading}
        submitButtonText={SubmitBtnText.AddDatabase}
        onSubmit={handleConnectionFormSubmit}
        onClose={onClose}
        onHostNamePaste={handlePostHostName}
        certificates={certificates}
        caCertificates={caCertificates}
      />
    </div>
  )
}

export default SentinelConnectionWrapper
