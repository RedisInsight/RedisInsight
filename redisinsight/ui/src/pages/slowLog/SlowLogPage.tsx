import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiText,
  EuiTitle,
} from '@elastic/eui'
import { format } from 'date-fns'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { SlowLog } from 'src/modules/slow-log/models'
import InstanceHeader from 'uiSrc/components/instance-header'
import { ConfigDBStorageItem } from 'uiSrc/constants/storage'
import { DATE_FORMAT } from 'uiSrc/pages/slowLog/components/SlowLogTable/SlowLogTable'
import { DurationUnits } from 'uiSrc/pages/slowLog/interfaces'
import { convertNumberByUnits } from 'uiSrc/pages/slowLog/utils'
import { getDBConfigStorageField } from 'uiSrc/services'
import {
  clearSlowLogAction,
  fetchSlowLogsAction,
  getSlowLogConfigAction,
  slowLogSelector
} from 'uiSrc/slices/slowlog/slowlog'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { numberWithSpaces } from 'uiSrc/utils/numbers'

import { EmptySlowLog, SlowLogTable, Actions } from './components'

import styles from './styles.module.scss'

const SlowLogPage = () => {
  const { data, loading, config } = useSelector(slowLogSelector)
  const { instanceId } = useParams<{ instanceId: string }>()
  const lastTimestamp = [...data].sort((a: any, b: any) => (a.time - b.time))[0]?.time || 0
  const [durationUnit, setDurationUnit] = useState(
    getDBConfigStorageField(instanceId, ConfigDBStorageItem.slowLogDurationUnit) || DurationUnits.microSeconds
  )

  const dispatch = useDispatch()

  useEffect(() => {
    getSlowLogs(
      (data: SlowLog[]) => {
        sendEventTelemetry({
          event: TelemetryEvent.SLOWLOG_LOADED,
          eventData: {
            databaseId: instanceId,
            numberOfCommands: data.length
          }
        })
      }
    )
    getConfig()
  }, [])

  const getSlowLogs = (onSuccess?: (data: SlowLog[]) => void) => {
    dispatch(fetchSlowLogsAction(instanceId, onSuccess))
  }

  const getConfig = () => {
    dispatch(getSlowLogConfigAction(instanceId))
  }

  const onClearSlowLogs = () => {
    dispatch(clearSlowLogAction(instanceId, () => {
      sendEventTelemetry({
        event: TelemetryEvent.SLOWLOG_CLEARED,
        eventData: {
          databaseId: instanceId
        }
      })
    }))
  }

  const isEmptySlowLog = !data.length && !loading

  return (
    <>
      <InstanceHeader />
      <div className={styles.main} data-testid="slow-log-page">
        <EuiFlexGroup className={styles.header} responsive={false} alignItems="center" justifyContent="spaceBetween">
          <EuiFlexItem grow={false}>
            <EuiTitle size="m" className={styles.title}>
              <h1>Slow Log</h1>
            </EuiTitle>
          </EuiFlexItem>

          <EuiFlexItem grow={false}>
            {config && (
              <EuiText size="xs" color="subdued" data-testid="config-info">
                Execution time: {numberWithSpaces(convertNumberByUnits(config.slowlogLogSlowerThan, durationUnit))}
                &nbsp;
                {durationUnit},
                Max length: {numberWithSpaces(config.slowlogMaxLen)}
              </EuiText>
            )}
          </EuiFlexItem>
        </EuiFlexGroup>

        <EuiFlexGroup className={styles.actionsLine} responsive={false} alignItems="center" justifyContent="spaceBetween">
          <EuiFlexItem grow={false}>
            {!isEmptySlowLog && lastTimestamp && (
              <EuiText size="xs" color="subdued" data-testid="entries-from-timestamp">
                {data.length} entries from {format(lastTimestamp * 1000, DATE_FORMAT)}
              </EuiText>
            )}
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <Actions
              isEmptySlowLog={isEmptySlowLog}
              onClear={onClearSlowLogs}
              onRefresh={getSlowLogs}
              durationUnit={durationUnit}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
        {isEmptySlowLog
          ? <EmptySlowLog />
          : <SlowLogTable items={data} loading={loading} durationUnit={durationUnit} />}
      </div>
    </>
  )
}

export default SlowLogPage
