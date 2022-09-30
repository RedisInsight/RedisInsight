import React from 'react'
import cx from 'classnames'
import { ShortDatabaseAnalysis, DatabaseAnalysis } from 'apiSrc/modules/database-analysis/models'
import { Nullable } from 'uiSrc/utils'
import { emptyMessageContent } from 'uiSrc/constants'

import EmptyAnalysisMessage from '../empty-analysis-message'
import TopNamespaceView from '../top-namespace-view'
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
      {!reports.length && !loading && (
        <EmptyAnalysisMessage
          title={emptyMessageContent.noReports.title}
          text={emptyMessageContent.noReports.text}
          name="reports"
        />
      )}
      {!!reports.length && data?.totalKeys?.total === 0 && !loading && (
        <EmptyAnalysisMessage
          title={emptyMessageContent.noKeys.title}
          text={emptyMessageContent.noKeys.text}
          name="keys"
        />
      )}
      <div className={cx(styles.grid, styles.content)}>
        <TopNamespaceView data={data} loading={loading} />
      </div>
    </>
  )
}

export default AnalysisDataView
