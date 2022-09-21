import { orderBy } from 'lodash'
import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import { EuiButton } from '@elastic/eui'
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
import { formatLongName, getDbIndex } from 'uiSrc/utils'

import NameSpacesTable from './components/nameSpacesTable'
import Header from './components/header'
import EmptyAnalysisMessage from './components/emptyAnalysisMessage'
import styles from './styles.module.scss'

export interface ModifiedClusterNodes extends ClusterNodeDetails {
  letter: string
  index: number
}

enum NSPTable {
  MEMORY = 'memory',
  KEYS = 'keys',
}

const MemoryEfficiencyPage = () => {
  const { instanceId } = useParams<{ instanceId: string }>()
  const {
    db,
    name: connectedInstanceName,
  } = useSelector(connectedInstanceSelector)
  const { viewTab } = useSelector(analyticsSettingsSelector)
  const { identified: analyticsIdentified } = useSelector(appAnalyticsInfoSelector)
  const { loading, data } = useSelector(memoryEfficiencySelector)
  const { loading: superLoading, data: analysis, selectedAnalysis } = useSelector(memoryEfficiencyHistorySelector)

  const [isPageViewSent, setIsPageViewSent] = useState(false)
  const [nspTable, setNspTable] = useState<NSPTable>(NSPTable.MEMORY)

  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchMemoryEfficiencyHistory(
      instanceId,
    ))

    if (viewTab !== AnalyticsViewTab.MemoryEfficiency) {
      dispatch(setAnalyticsViewTab(AnalyticsViewTab.MemoryEfficiency))
    }
  }, [])

  useEffect(() => {
    if (analysis.length && analysis.map(({ id }) => id).indexOf(selectedAnalysis) === -1) {
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

  const handleSelectAnalysis = (analysis) => {
    dispatch(setSelectedAnalysis(analysis))
  }

  const tabs = [
    {
      id: 'cobalt',
      name: 'TOP NAMESPACES',
      disabled: true,
      content: null,
    },
    {
      id: 'topMemoryNsp',
      name: 'by Memory',
      content: <NameSpacesTable data={data?.topMemoryNsp} loading={loading} />,
    },
    {
      id: 'topKeysNsp',
      name: 'by Number of Keys',
      content: <NameSpacesTable data={data?.topKeysNsp} loading={loading} />,
    },
  ]

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
        {!!data && (
          <>
            <Header
              analysis={analysis}
              selectedValue={selectedAnalysis}
              onChangeSelectedAnalysis={handleSelectAnalysis}
              progress={data.progress}
              loading={superLoading}
            />
            {
              analysis.length === 0 && !loading && (
                <EmptyAnalysisMessage />
              )
            }
            <div className={styles.grid}>
              <div style={{ height: '200px' }}>SUMMARY PER DATA TYPE</div>
              <div>MEMORY LIKELY TO BE FREED OVER TIME</div>
              {data?.topMemoryNsp?.length > 0 && data?.topKeysNsp?.length > 0 && (
                <div>
                  <span>TOP NAMESPACES</span>
                  <EuiButton
                    fill
                    size="s"
                    color="secondary"
                    onClick={() => setNspTable(NSPTable.MEMORY)}
                    disabled={nspTable === NSPTable.MEMORY}
                    className={cx(styles.textBtn, { [styles.activeBtn]: nspTable === NSPTable.MEMORY })}
                    data-testid="btn-change-mode"
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
                    data-testid="btn-change-mode"
                  >
                    by Number of Keys
                  </EuiButton>
                  {nspTable === NSPTable.MEMORY && (
                    <NameSpacesTable data={data?.topMemoryNsp} loading={loading} />
                  )}
                  {nspTable === NSPTable.KEYS && (
                    <NameSpacesTable data={data?.topKeysNsp} loading={loading} />
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default MemoryEfficiencyPage
