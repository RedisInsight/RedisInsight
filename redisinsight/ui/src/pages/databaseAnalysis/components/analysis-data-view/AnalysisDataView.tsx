import React from 'react'

import EmptyAnalysisMessage from '../empty-analysis-message'
import TopNamespaceView from '../top-namespace-view'
import { emptyMessageContent } from '../../constants'

import styles from '../../styles.module.scss'

const AnalysisDataView = (props) => {
  const { loading, reports, data } = props

  if (loading) {
    return (
      <div className={styles.grid}>
        <TopNamespaceView data={data} loading={loading} />
      </div>
    )
  }

  return (
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
      <div className={styles.grid}>
        <TopNamespaceView data={data} loading={loading} />
      </div>
      </>
  )
}

export default AnalysisDataView
