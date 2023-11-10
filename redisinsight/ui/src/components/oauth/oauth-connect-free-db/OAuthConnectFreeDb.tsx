import React from 'react'
import { EuiButton } from '@elastic/eui'
import { useDispatch, useSelector } from 'react-redux'

import { useLocation } from 'react-router-dom'
import { TelemetryEvent, getRedisModulesSummary, sendEventTelemetry } from 'uiSrc/telemetry'
import { OAuthSocialSource } from 'uiSrc/slices/interfaces'
import {
  checkConnectToInstanceAction,
  connectedInstanceSelector,
  freeInstanceSelector,
  instancesSelector,
} from 'uiSrc/slices/instances/instances'
import { openNewWindowDatabase } from 'uiSrc/utils'
import { Pages } from 'uiSrc/constants'

import styles from './styles.module.scss'

interface Props {
  source?: OAuthSocialSource | string
  onSuccessClick?: () => void
}

const OAuthConnectFreeDb = ({
  source = OAuthSocialSource.ListOfDatabases,
  onSuccessClick,
}: Props) => {
  const { loading } = useSelector(instancesSelector) ?? {}
  const { modules, provider } = useSelector(connectedInstanceSelector) ?? {}
  const { id = '' } = useSelector(freeInstanceSelector) ?? {}

  const dispatch = useDispatch()
  const { search } = useLocation()

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

  const connectToInstanceSuccess = () => {
    onSuccessClick?.()

    openNewWindowDatabase(Pages.browser(id) + search)
  }

  const handleCheckConnectToInstance = (
  ) => {
    sendTelemetry()
    dispatch(checkConnectToInstanceAction(
      id,
      connectToInstanceSuccess,
      () => {},
      false,
    ))
  }

  return (
    <EuiButton
      fill
      size="s"
      iconType="popout"
      isDisabled={loading}
      isLoading={loading}
      color="secondary"
      onClick={handleCheckConnectToInstance}
      className={styles.btn}
      data-testid="connect-free-db-btn"
    >
      Launch database
    </EuiButton>
  )
}

export default OAuthConnectFreeDb
