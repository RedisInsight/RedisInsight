import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiSuperSelect,
  EuiSuperSelectOption,
  EuiText,
  EuiTitle,
} from '@elastic/eui'
import { format } from 'date-fns'
import { minBy, toNumber } from 'lodash'
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
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { ConnectionType } from 'uiSrc/slices/interfaces'
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

const DEFAULT_COUNT_VALUE = '50'
const countOptions: EuiSuperSelectOption<string>[] = [
  { value: '10', inputDisplay: '10' },
  { value: '25', inputDisplay: '25' },
  { value: '50', inputDisplay: '50' },
  { value: '100', inputDisplay: '100' },
  { value: '-1', inputDisplay: 'Max' },
]

const SlowLogPage = () => {
  const { connectionType } = useSelector(connectedInstanceSelector)
  const { data, loading, config } = useSelector(slowLogSelector)
  const { instanceId } = useParams<{ instanceId: string }>()
  const [durationUnit, setDurationUnit] = useState(
    getDBConfigStorageField(instanceId, ConfigDBStorageItem.slowLogDurationUnit) || DurationUnits.microSeconds
  )
  const [count, setCount] = useState<string>(DEFAULT_COUNT_VALUE)

  const dispatch = useDispatch()

  const lastTimestamp = minBy(data, 'time')?.time

  useEffect(() => {
    getConfig()
  }, [])

  useEffect(() => {
    getSlowLogs()
  }, [count])

  const getSlowLogs = () => {
    dispatch(
      fetchSlowLogsAction(instanceId, toNumber(count), (data: SlowLog[]) => {
        sendEventTelemetry({
          event: TelemetryEvent.SLOWLOG_LOADED,
          eventData: {
            databaseId: instanceId,
            numberOfCommands: data.length
          }
        })
      })
    )
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
            {connectionType !== ConnectionType.Cluster && config && (
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
            <EuiFlexGroup responsive={false} alignItems="center" gutterSize="xs">
              <EuiFlexItem grow={false}>
                <EuiText color="subdued">
                  {connectionType === ConnectionType.Cluster ? 'Display per node:' : 'Display:'}
                </EuiText>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiSuperSelect
                  options={countOptions}
                  valueOfSelected={count}
                  onChange={(value) => setCount(value)}
                  className={styles.countSelect}
                  popoverClassName={styles.countSelectWrapper}
                  data-testid="count-select"
                />
              </EuiFlexItem>
              <EuiFlexItem grow={false} style={{ marginLeft: 12 }}>
                <EuiText size="xs" color="subdued" data-testid="entries-from-timestamp">
                  ({data.length} entries
                  {lastTimestamp && (<>&nbsp;from {format(lastTimestamp * 1000, DATE_FORMAT)}</>)})
                </EuiText>
              </EuiFlexItem>
            </EuiFlexGroup>
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
