import React from 'react'
import { ShortDatabaseAnalysis, DatabaseAnalysis } from 'apiSrc/modules/database-analysis/models'
import { Nullable } from 'uiSrc/utils'

import EmptyAnalysisMessage from '../empty-analysis-message'
import TopNamespaceView from '../top-namespace-view'
import { emptyMessageContent } from '../../constants'

import styles from '../../styles.module.scss'

export interface Props {
  data: Nullable<DatabaseAnalysis>
  reports: ShortDatabaseAnalysis[]
  loading: boolean
}

const AnalysisDataView = (props: Props) => {
  const { loading, reports = [], data } = props

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
            name="reports"
          />
        )
      }
      {
        reports.length && data?.totalKeys?.total === 0 && (
          <EmptyAnalysisMessage
            title={emptyMessageContent.noKeys.title}
            text={emptyMessageContent.noKeys.text}
            name="keys"
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
