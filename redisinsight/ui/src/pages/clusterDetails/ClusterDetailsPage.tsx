import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams } from 'react-router-dom'

import InstanceHeader from 'uiSrc/components/instance-header'
import { clusterDetailsSelector, fetchClusterDetailsAction } from 'uiSrc/slices/analytics/clusterDetails'
import { analyticsSettingsSelector, setAnalyticsViewTab } from 'uiSrc/slices/analytics/settings'
import { appAnalyticsInfoSelector } from 'uiSrc/slices/app/info'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { AnalyticsViewTab } from 'uiSrc/slices/interfaces/analytics'
import { sendPageViewTelemetry, TelemetryPageView } from 'uiSrc/telemetry'
import { formatLongName, getDbIndex, setTitle, } from 'uiSrc/utils'

import ClusterDetailsHeader from './components/cluster-details-header'
import styles from './styles.module.scss'

const POLLING_INTERVAL = 5_000

const ClusterDetailsPage = () => {
  let interval: NodeJS.Timeout
  const { instanceId } = useParams<{ instanceId: string }>()
  const {
    db,
    name: connectedInstanceName,
  } = useSelector(connectedInstanceSelector)
  const { viewTab } = useSelector(analyticsSettingsSelector)
  const { identified: analyticsIdentified } = useSelector(appAnalyticsInfoSelector)
  const { loading } = useSelector(clusterDetailsSelector)

  const [isPageViewSent, setIsPageViewSent] = useState(false)

  const dispatch = useDispatch()

  const dbName = `${formatLongName(connectedInstanceName, 33, 0, '...')} ${getDbIndex(db)}`
  setTitle(`${dbName} - Overview`)

  useEffect(() => {
    dispatch(fetchClusterDetailsAction(
      instanceId,
      () => {},
      () => clearInterval(interval)
    ))

    if (viewTab !== AnalyticsViewTab.ClusterDetails) {
      dispatch(setAnalyticsViewTab(AnalyticsViewTab.ClusterDetails))
    }
  }, [])

  useEffect(() => {
    if (!loading) {
      interval = setInterval(() => {
        if (document.hidden) return

        dispatch(fetchClusterDetailsAction(
          instanceId,
          () => {},
          () => clearInterval(interval)
        ))
      }, POLLING_INTERVAL)
    }
    return () => clearInterval(interval)
  }, [instanceId, loading])

  useEffect(() => {
    if (connectedInstanceName && !isPageViewSent && analyticsIdentified) {
      sendPageView(instanceId)
    }
  }, [connectedInstanceName, isPageViewSent, analyticsIdentified])

  const sendPageView = (instanceId: string) => {
    sendPageViewTelemetry({
      name: TelemetryPageView.CLUSTER_DETAILS_PAGE,
      databaseId: instanceId
    })
    setIsPageViewSent(true)
  }

  return (
    <>
      <InstanceHeader />
      <div className={styles.main} data-testid="cluster-details-page">
        <ClusterDetailsHeader />
      </div>
    </>
  )
}

export default ClusterDetailsPage
