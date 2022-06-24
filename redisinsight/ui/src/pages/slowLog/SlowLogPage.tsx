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
import { AutoSizer } from 'react-virtualized'

import InstanceHeader from 'uiSrc/components/instance-header'
import { DEFAULT_SLOWLOG_MAX_LEN } from 'uiSrc/constants'
import { DATE_FORMAT } from 'uiSrc/pages/slowLog/components/SlowLogTable/SlowLogTable'
import { convertNumberByUnits } from 'uiSrc/pages/slowLog/utils'
import { appAnalyticsInfoSelector } from 'uiSrc/slices/app/info'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { ConnectionType } from 'uiSrc/slices/interfaces'
import {
  clearSlowLogAction,
  fetchSlowLogsAction,
  getSlowLogConfigAction,
  slowLogConfigSelector,
  slowLogSelector
} from 'uiSrc/slices/slowlog/slowlog'
import { sendPageViewTelemetry, sendEventTelemetry, TelemetryEvent, TelemetryPageView } from 'uiSrc/telemetry'
import { formatLongName, getDbIndex, setTitle } from 'uiSrc/utils'
import { numberWithSpaces } from 'uiSrc/utils/numbers'

import { SlowLog } from 'apiSrc/modules/slow-log/models'
import { EmptySlowLog, SlowLogTable, Actions } from './components'

import styles from './styles.module.scss'

const HIDE_TIMESTAMP_FROM_WIDTH = 850
const DEFAULT_COUNT_VALUE = '50'
const MAX_COUNT_VALUE = '-1'
const countOptions: EuiSuperSelectOption<string>[] = [
  { value: '10', inputDisplay: '10' },
  { value: '25', inputDisplay: '25' },
  { value: '50', inputDisplay: '50' },
  { value: '100', inputDisplay: '100' },
  { value: MAX_COUNT_VALUE, inputDisplay: 'Max available' },
]

const SlowLogPage = () => {
  const { connectionType, name: connectedInstanceName, db } = useSelector(connectedInstanceSelector)
  const { data, loading, durationUnit, config } = useSelector(slowLogSelector)
  const { slowlogLogSlowerThan = 0, slowlogMaxLen } = useSelector(slowLogConfigSelector)
  const { identified: analyticsIdentified } = useSelector(appAnalyticsInfoSelector)
  const { instanceId } = useParams<{ instanceId: string }>()

  const [count, setCount] = useState<string>(DEFAULT_COUNT_VALUE)
  const [isPageViewSent, setIsPageViewSent] = useState(false)

  const dispatch = useDispatch()

  const lastTimestamp = minBy(data, 'time')?.time
  const dbName = `${formatLongName(connectedInstanceName, 33, 0, '...')} ${getDbIndex(db)}`
  setTitle(`${dbName} - Slow Log`)

  useEffect(() => {
    getConfig()
  }, [])

  useEffect(() => {
    getSlowLogs()
  }, [count])

  useEffect(() => {
    if (connectedInstanceName && !isPageViewSent && analyticsIdentified) {
      sendPageView(instanceId)
    }
  }, [connectedInstanceName, isPageViewSent, analyticsIdentified])

  const sendPageView = (instanceId: string) => {
    sendPageViewTelemetry({
      name: TelemetryPageView.SLOWLOG_PAGE,
      databaseId: instanceId
    })
    setIsPageViewSent(true)
  }

  const getSlowLogs = (maxLen?: number) => {
    const countToSend = count === MAX_COUNT_VALUE
      ? (maxLen || slowlogMaxLen || DEFAULT_SLOWLOG_MAX_LEN)
      : toNumber(count)

    dispatch(
      fetchSlowLogsAction(instanceId, countToSend, (data: SlowLog[]) => {
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
              Execution time: {numberWithSpaces(convertNumberByUnits(slowlogLogSlowerThan, durationUnit))}
                &nbsp;
              {durationUnit},
              Max length: {numberWithSpaces(slowlogMaxLen)}
            </EuiText>
            )}
          </EuiFlexItem>
        </EuiFlexGroup>

        <AutoSizer disableHeight>
          {({ width }) => (
            <div style={{ width }}>
              <EuiFlexGroup className={styles.actionsLine} responsive={false} alignItems="center" justifyContent="spaceBetween">
                <EuiFlexItem grow={false}>
                  <EuiFlexGroup responsive={false} alignItems="center" gutterSize="xs">
                    <EuiFlexItem grow={false}>
                      <EuiText color="subdued">
                        {connectionType === ConnectionType.Cluster ? 'Display per node:' : 'Display up to:'}
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
                    {width > HIDE_TIMESTAMP_FROM_WIDTH && (
                      <EuiFlexItem grow={false} style={{ marginLeft: 12 }}>
                        <EuiText size="xs" color="subdued" data-testid="entries-from-timestamp">
                          ({data.length} entries
                          {lastTimestamp && (<>&nbsp;from {format(lastTimestamp * 1000, DATE_FORMAT)}</>)})
                        </EuiText>
                      </EuiFlexItem>
                    )}
                  </EuiFlexGroup>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <Actions
                    width={width}
                    isEmptySlowLog={isEmptySlowLog}
                    durationUnit={durationUnit}
                    onClear={onClearSlowLogs}
                    onRefresh={getSlowLogs}
                  />
                </EuiFlexItem>
              </EuiFlexGroup>
            </div>
          )}
        </AutoSizer>
        {isEmptySlowLog
          ? <EmptySlowLog slowlogLogSlowerThan={slowlogLogSlowerThan} durationUnit={durationUnit} />
          : <SlowLogTable items={data} loading={loading} durationUnit={durationUnit} />}
      </div>
    </>
  )
}

export default SlowLogPage
