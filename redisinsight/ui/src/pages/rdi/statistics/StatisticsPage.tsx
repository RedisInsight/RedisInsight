import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { isEmpty } from 'lodash'

import { fetchRdiPipeline, rdiPipelineSelector } from 'uiSrc/slices/rdi/pipeline'
import { fetchRdiStatistics, rdiStatisticsSelector } from 'uiSrc/slices/rdi/statistics'
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

  const { loading: isPipelineLoading, data: pipelineData } = useSelector(rdiPipelineSelector)
  const { loading: isStatisticsLoading, data: statisticsData } = useSelector(rdiStatisticsSelector)

  useEffect(() => {
    if (!pipelineData) {
      dispatch(fetchRdiPipeline(rdiInstanceId))
    }

    dispatch(fetchRdiStatistics(rdiInstanceId))
  }, [])

  if (!statisticsData) {
    return null
  }

  return (
    <div className={styles.pageContainer}>
      <RdiStatisticsHeader loading={isPipelineLoading} />
      <div className={styles.bodyContainer}>
        {isEmpty(pipelineData) ? (
          <Empty rdiInstanceId={rdiInstanceId} />
        ) : (
          <>
            <Status data={statisticsData.rdiPipelineStatus} />
            <ProcessingPerformance
              data={statisticsData.processingPerformance}
              loading={isStatisticsLoading}
              onRefresh={() => {
                dispatch(fetchRdiStatistics(rdiInstanceId))
              }}
            />
            <TargetConnections data={statisticsData.connections} />
            <DataStreams
              data={statisticsData.dataStreams}
              loading={isStatisticsLoading}
              onRefresh={() => {
                dispatch(fetchRdiStatistics(rdiInstanceId))
              }}
            />
            <Clients
              data={statisticsData.clients}
              loading={isStatisticsLoading}
              onRefresh={() => {
                dispatch(fetchRdiStatistics(rdiInstanceId))
              }}
            />
          </>
        )}
      </div>
    </div>
  )
}

export default StatisticsPage
