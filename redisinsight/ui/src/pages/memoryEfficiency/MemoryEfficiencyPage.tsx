import { orderBy } from 'lodash'
import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams } from 'react-router-dom'
import { ClusterNodeDetails } from 'src/modules/cluster-monitor/models'

import InstanceHeader from 'uiSrc/components/instance-header'
import {
  memoryEfficiencySelector,
  memoryEfficiencyHistorySelector,
  fetchMemoryEfficiencyAction,
  fetchMemoryEfficiencyHistory,
  setSelectedAnalysis
} from 'uiSrc/slices/analytics/memoryEfficiency'
import { analyticsSettingsSelector, setAnalyticsViewTab } from 'uiSrc/slices/analytics/settings'
import { appAnalyticsInfoSelector } from 'uiSrc/slices/app/info'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { AnalyticsViewTab } from 'uiSrc/slices/interfaces/analytics'
import { sendPageViewTelemetry, TelemetryPageView } from 'uiSrc/telemetry'
import { formatLongName, getDbIndex, getLetterByIndex, Nullable, setTitle, } from 'uiSrc/utils'

import NameSpacesTable from './components/nameSpacesTable'
import Header from './components/header'
import styles from './styles.module.scss'

export interface ModifiedClusterNodes extends ClusterNodeDetails {
  letter: string
  index: number
}

const POLLING_INTERVAL = 5_000

const MemoryEfficiencyPage = () => {
  let interval: NodeJS.Timeout
  const { instanceId } = useParams<{ instanceId: string }>()
  const {
    db,
    name: connectedInstanceName,
  } = useSelector(connectedInstanceSelector)
  // const { viewTab } = useSelector(analyticsSettingsSelector)
  const { identified: analyticsIdentified } = useSelector(appAnalyticsInfoSelector)
  const { loading, data } = useSelector(memoryEfficiencySelector)
  const { loading: superLoading, data: analysis, selectedAnalysis } = useSelector(memoryEfficiencyHistorySelector)

  const [isPageViewSent, setIsPageViewSent] = useState(false)
  const [nodes, setNodes] = useState<Nullable<ModifiedClusterNodes[]>>(null)

  const dispatch = useDispatch()

  const dbName = `${formatLongName(connectedInstanceName, 33, 0, '...')} ${getDbIndex(db)}`
  setTitle(`${dbName} - Overview`)

  useEffect(() => {
    dispatch(fetchMemoryEfficiencyHistory(
      instanceId,
    ))
  }, [])

  useEffect(() => {
    if (analysis.length) {
      dispatch(setSelectedAnalysis(
        analysis[0].id,
      ))
    }
  }, [analysis])

  useEffect(() => {
    dispatch(fetchMemoryEfficiencyAction(
      instanceId,
      selectedAnalysis
    ))
  }, [selectedAnalysis])
  console.log(superLoading)

  const handleSelectAnalysis = (analysis) => {
    console.log(analysis)
    dispatch(setSelectedAnalysis(analysis))
  }

  // useEffect(() => {
  //   if (!loading) {
  //     interval = setInterval(() => {
  //       if (document.hidden) return

  //       dispatch(fetchMemoryEfficiencyAction(
  //         instanceId,
  //         () => {},
  //         () => clearInterval(interval)
  //       ))
  //     }, POLLING_INTERVAL)
  //   }
  //   return () => clearInterval(interval)
  // }, [instanceId, loading])

  // useEffect(() => {
  //   if (data) {
  //     const nodes = orderBy(data.nodes, ['asc', 'host'])
  //     const modifiedNodes = nodes.map((d, index) => ({ ...d, letter: getLetterByIndex(index), index }))
  //     setNodes(modifiedNodes)
  //   }
  // }, [data])

  // useEffect(() => {
  //   if (connectedInstanceName && !isPageViewSent && analyticsIdentified) {
  //     sendPageView(instanceId)
  //   }
  // }, [connectedInstanceName, isPageViewSent, analyticsIdentified])

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
        {!superLoading && (
          <Header
            analysis={analysis}
            selectedValue={selectedAnalysis}
            onChangeSelectedAnalysis={handleSelectAnalysis}
          />
        )}
        <NameSpacesTable nodes={nodes} loading={loading} />
      </div>
    </>
  )
}

export default MemoryEfficiencyPage
