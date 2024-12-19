import React, { useContext, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { DatabaseOverview } from 'uiSrc/components'
import {
  connectedInstanceOverviewSelector,
  connectedInstanceSelector,
  getDatabaseConfigInfoAction
} from 'uiSrc/slices/instances/instances'
import { ThemeContext } from 'uiSrc/contexts/themeContext'

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

  return (
    <DatabaseOverview
      metrics={getOverviewMetrics({ theme, items: overview, db })}
      loadData={loadData}
      lastRefreshTime={lastRefreshTime}
    />
  )
}

export default DatabaseOverviewWrapper
