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
import { applyTlSDatabase, autoFillFormDetails, getTlsSettings } from 'uiSrc/pages/home/utils'
import { ADD_NEW, NO_CA_CERT } from 'uiSrc/pages/home/constants'
import { InstanceType } from 'uiSrc/slices/interfaces'
import SentinelConnectionForm from './sentinel-connection-form'

export interface Props {
  width: number
  onClose?: () => void
}
const DEFAULT_SENTINEL_HOST = '127.0.0.1'
const DEFAULT_SENTINEL_PORT = '26379'

const INITIAL_VALUES = {
  host: DEFAULT_SENTINEL_HOST,
  port: DEFAULT_SENTINEL_PORT,
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
    const tlsSettings = getTlsSettings(values)

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
