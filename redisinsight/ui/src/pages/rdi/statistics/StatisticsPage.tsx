import React from 'react'

import Clients from './clients'
import DataStreams from './data-streams'
import RdiStatisticsHeader from './header'
import ProcessingPerformance from './processing-performance'
import Status from './status'
import TargetConnections from './target-connections'

import styles from './styles.module.scss'

const StatisticsPage = () => {
  console.log('test')

  return (
    <div className={styles.pageContainer}>
      <RdiStatisticsHeader />
      <div className={styles.bodyContainer}>
        <Status />
        <ProcessingPerformance />
        <TargetConnections />
        <DataStreams />
        <Clients />
      </div>
    </div>
  )
}

export default StatisticsPage
