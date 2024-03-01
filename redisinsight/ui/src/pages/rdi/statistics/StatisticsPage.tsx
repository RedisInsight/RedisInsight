import { isEmpty } from 'lodash'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import { connectedInstanceSelector, fetchConnectedInstanceAction } from 'uiSrc/slices/rdi/instances'
import { fetchRdiPipeline, rdiPipelineSelector } from 'uiSrc/slices/rdi/pipeline'
import { fetchRdiStatistics, rdiStatisticsSelector } from 'uiSrc/slices/rdi/statistics'
import { TelemetryEvent, TelemetryPageView, sendEventTelemetry, sendPageViewTelemetry } from 'uiSrc/telemetry'
import { ExplorePanelTemplate } from 'uiSrc/templates'
import { formatLongName, setTitle } from 'uiSrc/utils'
import Clients from './clients'
import DataStreams from './data-streams'
import Empty from './empty'
import RdiStatisticsHeader from './header'
import ProcessingPerformance from './processing-performance'
import Status from './status'
import TargetConnections from './target-connections'

import styles from './styles.module.scss'

const StatisticsPage = () => {
  const { rdiInstanceId } = useParams<{ rdiInstanceId: string }>()

  const dispatch = useDispatch()

  const { data: pipelineData } = useSelector(rdiPipelineSelector)
  const { loading: isStatisticsLoading, data: statisticsData } = useSelector(rdiStatisticsSelector)
  const { name: connectedRdiInstanceName } = useSelector(connectedInstanceSelector)

  const rdiInstanceName = formatLongName(connectedRdiInstanceName, 33, 0, '...')
  setTitle(`${rdiInstanceName} - Pipeline Status`)

  const onRefresh = (section: string) => {
    dispatch(fetchRdiStatistics(rdiInstanceId, section))
  }

  const onRefreshClicked = (section: string) => {
    sendEventTelemetry({
      event: TelemetryEvent.RDI_STATISTICS_REFRESH_CLICKED,
      eventData: {
        rdiInstanceId,
        section
      }
    })
  }

  const onChangeAutoRefresh = (section: string, enableAutoRefresh: boolean, refreshRate: string) => {
    sendEventTelemetry({
      event: enableAutoRefresh
        ? TelemetryEvent.RDI_STATISTICS_AUTO_REFRESH_ENABLED
        : TelemetryEvent.RDI_STATISTICS_AUTO_REFRESH_DISABLED,
      eventData: {
        rdiInstanceId,
        section,
        enableAutoRefresh,
        refreshRate
      }
    })
  }

  useEffect(() => {
    if (!pipelineData) {
      dispatch(fetchRdiPipeline(rdiInstanceId))
    }

    dispatch(fetchConnectedInstanceAction(rdiInstanceId))
    dispatch(fetchRdiStatistics(rdiInstanceId))

    sendPageViewTelemetry({
      name: TelemetryPageView.RDI_STATUS
    })
  }, [])

  if (!statisticsData) {
    return null
  }

  return (
    <div className={styles.pageContainer}>
      <RdiStatisticsHeader />
      <ExplorePanelTemplate>
        <div className={styles.bodyContainer}>
          {isEmpty(pipelineData) ? (
            <Empty rdiInstanceId={rdiInstanceId} />
          ) : (
            <>
              <Status data={statisticsData.rdiPipelineStatus} />
              <ProcessingPerformance
                data={statisticsData.processingPerformance}
                loading={isStatisticsLoading}
                onRefresh={() => onRefresh('processing_performance')}
                onRefreshClicked={() => onRefreshClicked('processing_performance')}
                onChangeAutoRefresh={(enableAutoRefresh: boolean, refreshRate: string) =>
                  onChangeAutoRefresh('processing_performance', enableAutoRefresh, refreshRate)}
              />
              <TargetConnections data={statisticsData.connections} />
              <DataStreams
                data={statisticsData.dataStreams}
                loading={isStatisticsLoading}
                onRefresh={() => {
                  dispatch(fetchRdiStatistics(rdiInstanceId, 'data_streams'))
                }}
                onRefreshClicked={() => onRefreshClicked('data_streams')}
                onChangeAutoRefresh={(enableAutoRefresh: boolean, refreshRate: string) =>
                  onChangeAutoRefresh('data_streams', enableAutoRefresh, refreshRate)}
              />
              <Clients
                data={statisticsData.clients}
                loading={isStatisticsLoading}
                onRefresh={() => {
                  dispatch(fetchRdiStatistics(rdiInstanceId, 'clients'))
                }}
                onRefreshClicked={() => onRefreshClicked('clients')}
                onChangeAutoRefresh={(enableAutoRefresh: boolean, refreshRate: string) =>
                  onChangeAutoRefresh('clients', enableAutoRefresh, refreshRate)}
              />
            </>
          )}
        </div>
      </ExplorePanelTemplate>
    </div>
  )
}

export default StatisticsPage
