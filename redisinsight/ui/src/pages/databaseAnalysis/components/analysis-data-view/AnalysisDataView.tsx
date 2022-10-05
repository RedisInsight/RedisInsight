import React from 'react'
import cx from 'classnames'
import { Nullable } from 'uiSrc/utils'
import { emptyMessageContent } from 'uiSrc/pages/databaseAnalysis'
import { ShortDatabaseAnalysis, DatabaseAnalysis } from 'apiSrc/modules/database-analysis/models'

import EmptyAnalysisMessage from '../empty-analysis-message'
import TopNamespaceView from '../top-namespace-view'
import SummaryPerData from '../summary-per-data'
import ExpirationGroupsView from '../analysis-ttl-view'
import styles from '../../styles.module.scss'

export interface Props {
  data: Nullable<DatabaseAnalysis>
  reports: ShortDatabaseAnalysis[]
  loading: boolean
}

const AnalysisDataView = (props: Props) => {
  const { loading, reports = [], data } = props

  return (
    <>
      {!loading && !reports.length && (
        <EmptyAnalysisMessage
          title={emptyMessageContent.noReports.title}
          text={emptyMessageContent.noReports.text}
          name="reports"
        />
      )}
      {!loading && !!reports.length && data?.totalKeys?.total === 0 && (
        <EmptyAnalysisMessage
          title={emptyMessageContent.noKeys.title}
          text={emptyMessageContent.noKeys.text}
          name="keys"
        />
      )}
      <div className={cx(styles.grid, styles.content)}>
        <SummaryPerData data={data} loading={loading} />
        <ExpirationGroupsView data={data} loading={loading} />
        <TopNamespaceView data={data} loading={loading} />
      </div>
    </>
  )
}

export default AnalysisDataView
