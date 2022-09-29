import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams } from 'react-router-dom'
import { EuiFlexGroup } from '@elastic/eui'

import InstanceHeader from 'uiSrc/components/instance-header'
import {
  DBAnalysisSelector,
  DBAnalysisReportsSelector,
  fetchDBAnalysisAction,
  fetchDBAnalysisReportsHistory,
  setSelectedAnalysisId
} from 'uiSrc/slices/analytics/dbAnalysis'
import { analyticsSettingsSelector, setAnalyticsViewTab } from 'uiSrc/slices/analytics/settings'
import { appAnalyticsInfoSelector } from 'uiSrc/slices/app/info'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { AnalyticsViewTab } from 'uiSrc/slices/interfaces/analytics'
import { sendPageViewTelemetry, sendEventTelemetry, TelemetryPageView, TelemetryEvent } from 'uiSrc/telemetry'

import Header from './components/header'
import AnalysisDataView from './components/analysis-data-view'
import styles from './styles.module.scss'

const DatabaseAnalysisPage = () => {
  const { instanceId } = useParams<{ instanceId: string }>()
  const { viewTab } = useSelector(analyticsSettingsSelector)
  const { identified: analyticsIdentified } = useSelector(appAnalyticsInfoSelector)
  const { loading: analysisLoading, data } = useSelector(DBAnalysisSelector)
  const { data: reports, selectedAnalysis } = useSelector(DBAnalysisReportsSelector)
  const { name: connectedInstanceName } = useSelector(connectedInstanceSelector)

  const [isPageViewSent, setIsPageViewSent] = useState<boolean>(false)

  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchDBAnalysisReportsHistory(
      instanceId,
    ))

    if (viewTab !== AnalyticsViewTab.DatabaseAnalysis) {
      dispatch(setAnalyticsViewTab(AnalyticsViewTab.DatabaseAnalysis))
    }
  }, [])

  useEffect(() => {
    if (!selectedAnalysis && reports?.length) {
      dispatch(setSelectedAnalysisId(
        reports[0].id!,
      ))
      dispatch(fetchDBAnalysisAction(
        instanceId,
        reports[0].id!
      ))
    }
  }, [selectedAnalysis, reports])

  const handleSelectAnalysis = (reportId: string) => {
    sendEventTelemetry({
      event: TelemetryEvent.MEMORY_ANALYSIS_HISTORY_VIEWED,
      eventData: {
        databaseId: instanceId,
      }
    })
    dispatch(setSelectedAnalysisId(reportId))
    dispatch(fetchDBAnalysisAction(
      instanceId,
      reportId
    ))
  }

  useEffect(() => {
    if (connectedInstanceName && !isPageViewSent && analyticsIdentified) {
      sendPageView(instanceId)
    }
  }, [connectedInstanceName, isPageViewSent, analyticsIdentified])

  const sendPageView = (instanceId: string) => {
    sendPageViewTelemetry({
      name: TelemetryPageView.DATABASE_ANALYSIS,
      databaseId: instanceId
    })
    setIsPageViewSent(true)
  }

  return (
    <>
      <InstanceHeader />
      <div className={styles.main} data-testid="database-analysis-page">
        <Header
          reports={reports}
          selectedValue={selectedAnalysis}
          onChangeSelectedAnalysis={handleSelectAnalysis}
          progress={data?.progress}
          analysisLoading={analysisLoading}
        />
        <AnalysisDataView loading={analysisLoading} reports={reports} data={data} />
      </div>
    </>
  )
}

export default DatabaseAnalysisPage
