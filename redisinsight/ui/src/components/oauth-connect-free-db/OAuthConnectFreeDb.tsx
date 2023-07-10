import React from 'react'
import { EuiButton } from '@elastic/eui'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'

import { TelemetryEvent, getRedisModulesSummary, sendEventTelemetry } from 'uiSrc/telemetry'
import { OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { checkConnectToInstanceAction, connectedInstanceSelector, setConnectedInstanceId } from 'uiSrc/slices/instances/instances'
import { resetKeys } from 'uiSrc/slices/browser/keys'
import { appContextSelector, setAppContextInitialState } from 'uiSrc/slices/app/context'
import { PageNames, Pages } from 'uiSrc/constants'

import styles from './styles.module.scss'

interface Props {
  source?: OAuthSocialSource
  children: React.ReactElement
}

const OAuthConnectFreeDb = ({ children, source = OAuthSocialSource.ListOfDatabases }: Props) => {
  const { instanceId } = useParams<{ instanceId: string }>()
  const { isFreeDb = false, modules, provider } = useSelector(connectedInstanceSelector) ?? {}
  const { lastPage, contextInstanceId } = useSelector(appContextSelector) ?? {}

  const dispatch = useDispatch()
  const history = useHistory()

  if (!isFreeDb) {
    return (children)
  }

  const sendTelemetry = () => {
    const modulesSummary = getRedisModulesSummary(modules)
    sendEventTelemetry({
      event: TelemetryEvent.CONFIG_DATABASES_OPEN_DATABASE,
      eventData: {
        databaseId: instanceId,
        provider,
        source,
        ...modulesSummary,
      }
    })
  }

  const connectToInstance = () => {
    if (contextInstanceId && contextInstanceId !== instanceId) {
      dispatch(resetKeys())
      dispatch(setAppContextInitialState())
    }
    dispatch(setConnectedInstanceId(id ?? ''))

    if (lastPage === PageNames.workbench && contextInstanceId === id) {
      history.push(Pages.workbench(instanceId))
      return
    }
    history.push(Pages.browser(instanceId))
  }

  const handleCheckConnectToInstance = (
  ) => {
    sendTelemetry()
    dispatch(checkConnectToInstanceAction(instanceId, connectToInstance))
  }

  return (
    <EuiButton
      onClick={handleCheckConnectToInstance}
      className={styles.btn}
      data-testid="connect-free-db-btn"
    >
      Connect
    </EuiButton>
  )
}

export default OAuthConnectFreeDb
