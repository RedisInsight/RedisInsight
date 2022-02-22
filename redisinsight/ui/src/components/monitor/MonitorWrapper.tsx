import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import { monitorSelector, toggleRunMonitor } from 'uiSrc/slices/cli/monitor'
import { cliSettingsSelector } from 'uiSrc/slices/cli/cli-settings'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import Monitor from './Monitor'
import MonitorHeader from './MonitorHeader'

import styles from './Monitor/styles.module.scss'

const MonitorWrapper = () => {
  const { instanceId = '' } = useParams<{ instanceId: string }>()
  const { items, isStarted, isRunning, error } = useSelector(monitorSelector)
  const { isShowCli, isShowHelper, } = useSelector(cliSettingsSelector)

  const dispatch = useDispatch()

  const onRunMonitor = () => {
    sendEventTelemetry({
      event: isRunning ? TelemetryEvent.PROFILER_STOPPED : TelemetryEvent.PROFILER_STARTED,
      eventData: { databaseId: instanceId }
    })
    dispatch(toggleRunMonitor())
  }

  return (
    <section className={styles.monitorWrapper} data-testid="monitor-container">
      <MonitorHeader handleRunMonitor={onRunMonitor} />
      <Monitor
        scrollViewOnAppear
        items={items}
        error={error}
        isStarted={isStarted}
        isRunning={isRunning}
        isShowCli={isShowCli}
        isShowHelper={isShowHelper}
        handleRunMonitor={onRunMonitor}
      />
    </section>

  )
}

export default React.memo(MonitorWrapper)
