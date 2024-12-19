import React, { useContext, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { DatabaseOverview } from 'uiSrc/components'
import {
  connectedInstanceOverviewSelector,
  connectedInstanceSelector,
  getDatabaseConfigInfoAction
} from 'uiSrc/slices/instances/instances'
import { ThemeContext } from 'uiSrc/contexts/themeContext'

import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { getOverviewMetrics } from './components/OverviewMetrics'

const DatabaseOverviewWrapper = () => {
  const { theme } = useContext(ThemeContext)
  const [lastRefreshTime, setLastRefreshTime] = useState<number | null>(null)
  const { id: connectedInstanceId = '', db } = useSelector(connectedInstanceSelector)
  const overview = useSelector(connectedInstanceOverviewSelector)

  const dispatch = useDispatch()

  const loadData = () => {
    dispatch(getDatabaseConfigInfoAction(connectedInstanceId))
    setLastRefreshTime(Date.now())
  }

  const handleEnableAutoRefresh = (enableAutoRefresh: boolean, refreshRate: string) => {
    sendEventTelemetry({
      event: enableAutoRefresh
        ? TelemetryEvent.OVERVIEW_AUTO_REFRESH_ENABLED
        : TelemetryEvent.OVERVIEW_AUTO_REFRESH_DISABLED,
      eventData: {
        databaseId: connectedInstanceId,
        refreshRate: +refreshRate
      }
    })
  }

  return (
    <DatabaseOverview
      metrics={getOverviewMetrics({ theme, items: overview, db })}
      loadData={loadData}
      lastRefreshTime={lastRefreshTime}
      handleEnableAutoRefresh={handleEnableAutoRefresh}
    />
  )
}

export default DatabaseOverviewWrapper
