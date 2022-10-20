import React, { useEffect, useState } from 'react'
import cx from 'classnames'
import { isNull } from 'lodash'
import { useParams } from 'react-router-dom'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { Nullable } from 'uiSrc/utils'
import { DEFAULT_EXTRAPOLATION, EmptyMessage, SectionName } from 'uiSrc/pages/databaseAnalysis/constants'
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
  const [extrapolation, setExtrapolation] = useState(DEFAULT_EXTRAPOLATION)

  const { instanceId } = useParams<{ instanceId: string }>()

  useEffect(() => {
    if (data?.progress?.processed) {
      setExtrapolation(data.progress.total / data.progress.processed)
    }
  }, [data])

  const onSwitchExtrapolation = (value: boolean, section: SectionName) => {
    sendEventTelemetry({
      event: TelemetryEvent.DATABASE_ANALYSIS_EXTRAPOLATION_CHANGED,
      eventData: {
        databaseId: instanceId,
        from: !value,
        to: value,
        section
      }
    })
  }

  return (
    <>
      {!loading && !reports.length && (
        <EmptyAnalysisMessage name={EmptyMessage.Reports} />
      )}
      {!loading && !!reports.length && data?.totalKeys?.total === 0 && (
        <EmptyAnalysisMessage name={EmptyMessage.Keys} />
      )}
      {!loading && !!reports.length && isNull(data?.totalKeys) && (
        <EmptyAnalysisMessage name={EmptyMessage.Encrypt} />
      )}
      <div className={cx(styles.content)}>
        <SummaryPerData
          data={data}
          loading={loading}
          extrapolation={extrapolation}
          onSwitchExtrapolation={onSwitchExtrapolation}
        />
        <ExpirationGroupsView
          data={data}
          loading={loading}
          extrapolation={extrapolation}
          onSwitchExtrapolation={onSwitchExtrapolation}
        />
        <TopNamespace
          data={data}
          loading={loading}
          extrapolation={extrapolation}
          onSwitchExtrapolation={onSwitchExtrapolation}
        />
        <TopKeys data={data} loading={loading} />
      </div>
    </>
  )
}

export default AnalysisDataView
