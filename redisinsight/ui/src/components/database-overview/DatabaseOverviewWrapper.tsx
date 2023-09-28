import React, { useContext, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { DatabaseOverview } from 'uiSrc/components'
import {
  connectedInstanceOverviewSelector,
  connectedInstanceSelector,
  getDatabaseConfigInfoAction
} from 'uiSrc/slices/instances/instances'
import { ThemeContext } from 'uiSrc/contexts/themeContext'

import { getOverviewMetrics } from './components/OverviewMetrics'

const TIMEOUT_TO_GET_INFO = process.env.NODE_ENV !== 'development' ? 5000 : 60_000

interface IProps { windowDimensions: number }

const DatabaseOverviewWrapper = ({ windowDimensions } :IProps) => {
  let interval: NodeJS.Timeout
  const { theme } = useContext(ThemeContext)
  const { id: connectedInstanceId = '', modules = [], db } = useSelector(connectedInstanceSelector)
  const overview = useSelector(connectedInstanceOverviewSelector)

  const dispatch = useDispatch()

  useEffect(() => {
    interval = setInterval(() => {
      if (document.hidden) return

      dispatch(getDatabaseConfigInfoAction(
        connectedInstanceId,
        () => {},
        () => clearInterval(interval)
      ))
    }, TIMEOUT_TO_GET_INFO)
    return () => clearInterval(interval)
  }, [connectedInstanceId])

  return (
    <DatabaseOverview
      modules={modules}
      metrics={getOverviewMetrics({ theme, items: overview, db })}
      windowDimensions={windowDimensions}
    />
  )
}

export default DatabaseOverviewWrapper
