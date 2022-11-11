import React, { useMemo } from 'react'
import { EuiTab, EuiTabs } from '@elastic/eui'
import { isNull } from 'lodash'
import { useDispatch, useSelector } from 'react-redux'
import { EmptyMessage } from 'uiSrc/pages/databaseAnalysis/constants'
import { EmptyAnalysisMessage } from 'uiSrc/pages/databaseAnalysis/components'
import { setDatabaseAnalysisViewTab, dbAnalysisViewTabSelector } from 'uiSrc/slices/analytics/dbAnalysis'
import { DatabaseAnalysisViewTab } from 'uiSrc/slices/interfaces/analytics'
import { Nullable } from 'uiSrc/utils'
import { ShortDatabaseAnalysis, DatabaseAnalysis } from 'apiSrc/modules/database-analysis/models'

import { databaseAnalysisTabs } from './constants'
import styles from './styles.module.scss'

export interface Props {
  loading: boolean
  reports: ShortDatabaseAnalysis[]
  data: Nullable<DatabaseAnalysis>
}

const DatabaseAnalysisTabs = (props: Props) => {
  const { loading, reports, data } = props

  const viewTab = useSelector(dbAnalysisViewTabSelector)

  const dispatch = useDispatch()

  const selectedTabContent = useMemo(() => databaseAnalysisTabs.find((tab) => tab.id === viewTab)?.content, [viewTab])

  const onSelectedTabChanged = (id: DatabaseAnalysisViewTab) => {
    dispatch(setDatabaseAnalysisViewTab(id))
  }

  const renderTabs = () => (
    databaseAnalysisTabs.map(({ id, name }) => (
      <EuiTab
        key={id}
        onClick={() => onSelectedTabChanged(id)}
        isSelected={id === viewTab}
        data-testid={`${id}-tab`}
      >
        {name(data?.recommendations?.length)}
      </EuiTab>
    )))

  if (!loading && !reports?.length) {
    return (
      <div data-testid="empty-reports-wrapper" className={styles.emptyMessageWrapper}>
        <EmptyAnalysisMessage name={EmptyMessage.Reports} />
      </div>
    )
  }
  if (!loading && !!reports?.length && isNull(data?.totalKeys)) {
    return (
      <div data-testid="empty-encrypt-wrapper" className={styles.emptyMessageWrapper}>
        <EmptyAnalysisMessage name={EmptyMessage.Encrypt} />
      </div>
    )
  }

  return (
    <>
      <EuiTabs className="tabs-active-borders">{renderTabs()}</EuiTabs>
      <div className={styles.container}>
        {selectedTabContent}
      </div>
    </>
  )
}

export default DatabaseAnalysisTabs
