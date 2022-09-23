import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import { EuiButton, EuiTitle } from '@elastic/eui'
import InstanceHeader from 'uiSrc/components/instance-header'
import {
  DBAnalysis,
  DBAnalysisReportsSelector,
  fetchDBAnalysisAction,
  fetchDBAnalysisReportsHistory,
  setSelectedAnalysisId
} from 'uiSrc/slices/analytics/dbAnalysis'
import { analyticsSettingsSelector, setAnalyticsViewTab } from 'uiSrc/slices/analytics/settings'
import { appAnalyticsInfoSelector } from 'uiSrc/slices/app/info'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { AnalyticsViewTab } from 'uiSrc/slices/interfaces/analytics'
import { sendPageViewTelemetry, TelemetryPageView } from 'uiSrc/telemetry'

import NameSpacesTable from './components/nameSpacesTable'
import Header from './components/header'
import EmptyAnalysisMessage from './components/emptyAnalysisMessage'
import Skeleton from './components/skeleton'
import { NSPTable, emptyMessageContent } from './constants'
import styles from './styles.module.scss'

const DatabaseAnalysisPage = () => {
  const { instanceId } = useParams<{ instanceId: string }>()
  const { viewTab } = useSelector(analyticsSettingsSelector)
  const { identified: analyticsIdentified } = useSelector(appAnalyticsInfoSelector)
  const { loading: analysisLoading, data } = useSelector(DBAnalysis)
  const { loading: reportsLoading, data: reports, selectedAnalysis } = useSelector(DBAnalysisReportsSelector)
  const { name: connectedInstanceName } = useSelector(connectedInstanceSelector)

  const [isPageViewSent, setIsPageViewSent] = useState<boolean>(false)
  const [nspTable, setNspTable] = useState<NSPTable>(NSPTable.MEMORY)

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
    if (reports && reports.length && reports.map(({ id }) => id).indexOf(selectedAnalysis) === -1) {
      dispatch(setSelectedAnalysisId(
        reports[0].id,
      ))
      dispatch(fetchDBAnalysisAction(
        instanceId,
        reports[0].id
      ))
    }
  }, [reports])

  const handleSelectAnalysis = (reportId: string) => {
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
      <div className={styles.main} data-testid="cluster-details-page">
        <>
          <Header
            reports={reports}
            selectedValue={selectedAnalysis}
            onChangeSelectedAnalysis={handleSelectAnalysis}
            progress={data?.progress ?? null}
            loading={reportsLoading}
            analysisLoading={analysisLoading}
          />
          {analysisLoading && (<Skeleton />)}
          {!analysisLoading && (
            <>
              {
                reports.length === 0 && (
                  <EmptyAnalysisMessage
                    title={emptyMessageContent.noReports.title}
                    text={emptyMessageContent.noReports.text}
                  />
                )
              }
              {
                !!reports.length && data?.totalKeys?.total === 0 && (
                  <EmptyAnalysisMessage
                    title={emptyMessageContent.noKeys.title}
                    text={emptyMessageContent.noKeys.text}
                  />
                )
              }
              {!!data?.totalKeys?.total && reports.length !== 0 && (
                <div className={styles.grid}>
                  {!!data && data?.topMemoryNsp?.length > 0 && data?.topKeysNsp?.length > 0 && (
                    <div>
                      <EuiTitle className={styles.sectionTitle}>
                        <h4>TOP NAMESPACES</h4>
                      </EuiTitle>
                      <EuiButton
                        fill
                        size="s"
                        color="secondary"
                        onClick={() => setNspTable(NSPTable.MEMORY)}
                        disabled={nspTable === NSPTable.MEMORY}
                        className={cx(styles.textBtn, { [styles.activeBtn]: nspTable === NSPTable.MEMORY })}
                        data-testid="btn-change-mode-memory"
                      >
                        by Memory
                      </EuiButton>
                      <EuiButton
                        fill
                        size="s"
                        color="secondary"
                        onClick={() => setNspTable(NSPTable.KEYS)}
                        disabled={nspTable === NSPTable.KEYS}
                        className={cx(styles.textBtn, { [styles.activeBtn]: nspTable === NSPTable.KEYS })}
                        data-testid="btn-change-mode-keys"
                      >
                        by Number of Keys
                      </EuiButton>
                      {nspTable === NSPTable.MEMORY && (
                        <NameSpacesTable
                          data={data?.topMemoryNsp}
                          delimiter={data?.delimiter}
                          data-testid="nsp-table-memory"
                        />
                      )}
                      {nspTable === NSPTable.KEYS && (
                        <NameSpacesTable
                          data={data?.topKeysNsp}
                          delimiter={data?.delimiter}
                          data-testid="nsp-table-keys"
                        />
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </>
      </div>
    </>
  )
}

export default DatabaseAnalysisPage
