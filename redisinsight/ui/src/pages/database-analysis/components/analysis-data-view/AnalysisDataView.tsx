import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import cx from 'classnames'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { dbAnalysisSelector, dbAnalysisReportsSelector } from 'uiSrc/slices/analytics/dbAnalysis'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { DEFAULT_EXTRAPOLATION, EmptyMessage, SectionName } from 'uiSrc/pages/database-analysis/constants'
import {
  TopKeys,
  EmptyAnalysisMessage,
  TopNamespace,
  SummaryPerData,
  ExpirationGroupsView
} from 'uiSrc/pages/database-analysis/components'

import styles from './styles.module.scss'

const AnalysisDataView = () => {
  const { id: instanceId, provider } = useSelector(connectedInstanceSelector)
  const { loading, data } = useSelector(dbAnalysisSelector)
  const { data: reports } = useSelector(dbAnalysisReportsSelector)

  const [extrapolation, setExtrapolation] = useState(DEFAULT_EXTRAPOLATION)

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
        section,
        provider
      }
    })
  }

  if (!loading && !!reports?.length && data?.totalKeys?.total === 0) {
    return (<EmptyAnalysisMessage name={EmptyMessage.Keys} />)
  }

  return (
    <>
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
