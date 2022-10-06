import React from 'react'
import cx from 'classnames'
import { Nullable } from 'uiSrc/utils'
import { EmptyMessage } from 'uiSrc/pages/databaseAnalysis/constants'
import {
  TopKeys,
  EmptyAnalysisMessage,
  TopNamespace,
  SummaryPerData,
  ExpirationGroupsView
} from 'uiSrc/pages/databaseAnalysis/components'
import { ShortDatabaseAnalysis, DatabaseAnalysis } from 'apiSrc/modules/database-analysis/models'

import styles from './styles.module.scss'

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
        <EmptyAnalysisMessage name={EmptyMessage.Reports} />
      )}
      {!loading && !!reports.length && data?.totalKeys?.total === 0 && (
        <EmptyAnalysisMessage name={EmptyMessage.Keys} />
      )}
      <div className={cx(styles.grid, styles.content)}>
        <SummaryPerData data={data} loading={loading} />
        <ExpirationGroupsView data={data} loading={loading} />
        <div>
          <TopNamespace data={data} loading={loading} />
          <TopKeys data={data} loading={loading} />
        </div>
      </div>
    </>
  )
}

export default AnalysisDataView
