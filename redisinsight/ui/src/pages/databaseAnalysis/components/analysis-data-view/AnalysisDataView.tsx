import React from 'react'
import cx from 'classnames'
import { Nullable } from 'uiSrc/utils'
import { ShortDatabaseAnalysis, DatabaseAnalysis } from 'apiSrc/modules/database-analysis/models'

import TopKeys from '../top-keys'
import EmptyAnalysisMessage from '../empty-analysis-message'
import TopNamespace from '../top-namespace'
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
        <EmptyAnalysisMessage name="reports" />
      )}
      {!loading && !!reports.length && data?.totalKeys?.total === 0 && (
        <EmptyAnalysisMessage name="keys" />
      )}
      <div className={cx(styles.grid, styles.content)}>
        <SummaryPerData data={data} loading={loading} />
        <ExpirationGroupsView data={data} loading={loading} />
        <TopNamespace data={data} loading={loading} />
        <TopKeys data={data} loading={loading} />
      </div>
    </>
  )
}

export default AnalysisDataView
