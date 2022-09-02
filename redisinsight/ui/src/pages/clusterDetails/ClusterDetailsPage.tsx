import { orderBy } from 'lodash'
import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams } from 'react-router-dom'
import { ClusterNodeDetails } from 'src/modules/cluster-monitor/models'

import InstanceHeader from 'uiSrc/components/instance-header'
import ClusterNodesTable from 'uiSrc/pages/clusterDetails/components/cluser-nodes-table'
import { clusterDetailsSelector, fetchClusterDetailsAction } from 'uiSrc/slices/analytics/clusterDetails'
import { analyticsSettingsSelector, setAnalyticsViewTab } from 'uiSrc/slices/analytics/settings'
import { appAnalyticsInfoSelector } from 'uiSrc/slices/app/info'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { AnalyticsViewTab } from 'uiSrc/slices/interfaces/analytics'
import { sendPageViewTelemetry, TelemetryPageView } from 'uiSrc/telemetry'
import { formatLongName, getDbIndex, getLetterByIndex, Nullable, setTitle, } from 'uiSrc/utils'

import ClusterDetailsHeader from './components/cluster-details-header'
import styles from './styles.module.scss'

export interface ModifiedClusterNodes extends ClusterNodeDetails {
  letter: string
  index: number
}

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
  const { loading, data } = useSelector(clusterDetailsSelector)

  const [isPageViewSent, setIsPageViewSent] = useState(false)
  const [nodes, setNodes] = useState<Nullable<ModifiedClusterNodes[]>>(null)

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
    if (data) {
      const nodes = orderBy(data.nodes, ['asc', 'host'])
      const modifiedNodes = nodes.map((d, index) => ({ ...d, letter: getLetterByIndex(index), index }))
      setNodes(modifiedNodes)
    }
  }, [data])

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
        <ClusterNodesTable nodes={nodes} loading={loading} />
      </div>
    </>
  )
}

export default ClusterDetailsPage
