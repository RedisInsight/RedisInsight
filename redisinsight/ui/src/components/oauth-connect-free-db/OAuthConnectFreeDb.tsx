import React from 'react'
import { EuiButton } from '@elastic/eui'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'

import { TelemetryEvent, getRedisModulesSummary, sendEventTelemetry } from 'uiSrc/telemetry'
import { OAuthSocialSource } from 'uiSrc/slices/interfaces'
import {
  checkConnectToInstanceAction,
  connectedInstanceSelector,
  freeInstanceSelector,
  instancesSelector,
  setConnectedInstanceId,
} from 'uiSrc/slices/instances/instances'
import { resetKeys } from 'uiSrc/slices/browser/keys'
import { appContextSelector, setAppContextInitialState } from 'uiSrc/slices/app/context'
import { Pages } from 'uiSrc/constants'

import styles from './styles.module.scss'

interface Props {
  source?: OAuthSocialSource
  onSuccessClick?: () => void
}

const OAuthConnectFreeDb = ({
  source = OAuthSocialSource.ListOfDatabases,
  onSuccessClick,
}: Props) => {
  const { loading } = useSelector(instancesSelector) ?? {}
  const { modules, provider } = useSelector(connectedInstanceSelector) ?? {}
  const { contextInstanceId } = useSelector(appContextSelector)
  const { id = '' } = useSelector(freeInstanceSelector) ?? {}

  const dispatch = useDispatch()
  const history = useHistory()

  if (!id) {
    return null
  }

  const sendTelemetry = () => {
    const modulesSummary = getRedisModulesSummary(modules)
    sendEventTelemetry({
      event: TelemetryEvent.CONFIG_DATABASES_OPEN_DATABASE,
      eventData: {
        databaseId: id,
        provider,
        source,
        ...modulesSummary,
      }
    })
  }

  const connectToInstance = () => {
    onSuccessClick?.()
    if (contextInstanceId && contextInstanceId !== id) {
      dispatch(resetKeys())
      dispatch(setAppContextInitialState())
    }
    dispatch(setConnectedInstanceId(id ?? ''))

    history.push(Pages.home)
    setTimeout(() => {
      history.push(Pages.browser(id))
    }, 0)
  }

  const handleCheckConnectToInstance = (
  ) => {
    sendTelemetry()
    dispatch(checkConnectToInstanceAction(id, connectToInstance))
  }

  return (
    <EuiButton
      fill
      isDisabled={loading}
      isLoading={loading}
      color="secondary"
      onClick={handleCheckConnectToInstance}
      className={styles.btn}
      data-testid="connect-free-db-btn"
    >
      Connect
    </EuiButton>
  )
}

export default OAuthConnectFreeDb
