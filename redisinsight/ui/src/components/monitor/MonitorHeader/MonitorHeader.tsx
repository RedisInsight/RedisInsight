import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { EuiIcon } from '@elastic/eui'

import {
  monitorSelector,
  resetMonitorItems,
  setMonitorInitialState,
  toggleHideMonitor,
  toggleMonitor,
} from 'uiSrc/slices/cli/monitor'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { OnboardingTour, RiTooltip } from 'uiSrc/components'
import { ONBOARDING_FEATURES } from 'uiSrc/components/onboarding-features'

import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import {
  PlayIcon,
  PauseIcon,
  DeleteIcon,
  BannedIcon,
} from 'uiSrc/components/base/icons'
import { WindowControlGroup } from 'uiSrc/components/base/shared/WindowControlGroup'
import styles from './styles.module.scss'

export interface Props {
  handleRunMonitor: () => void
}

const MonitorHeader = ({ handleRunMonitor }: Props) => {
  const { instanceId = '' } = useParams<{ instanceId: string }>()
  const {
    isRunning,
    isPaused,
    isResumeLocked,
    isStarted,
    items = [],
    error,
    loadingPause,
  } = useSelector(monitorSelector)
  const isErrorShown = !!error && !isRunning
  const disabledPause = isErrorShown || isResumeLocked || loadingPause
  const dispatch = useDispatch()

  const handleCloseMonitor = () => {
    if (isRunning) {
      sendEventTelemetry({
        event: TelemetryEvent.PROFILER_STOPPED,
        eventData: { databaseId: instanceId },
      })
    }
    sendEventTelemetry({
      event: TelemetryEvent.PROFILER_CLOSED,
      eventData: { databaseId: instanceId },
    })
    dispatch(setMonitorInitialState())
  }

  const handleHideMonitor = () => {
    sendEventTelemetry({
      event: TelemetryEvent.PROFILER_MINIMIZED,
      eventData: { databaseId: instanceId },
    })

    dispatch(toggleMonitor())
    dispatch(toggleHideMonitor())
  }

  const handleClearMonitor = () => {
    sendEventTelemetry({
      event: TelemetryEvent.PROFILER_CLEARED,
      eventData: { databaseId: instanceId },
    })
    dispatch(resetMonitorItems())
  }

  return (
    <div className={styles.container} data-testid="monitor-header">
      <Row justify="between" align="center" style={{ height: '100%' }}>
        <FlexItem className={styles.title}>
          <EuiIcon type="inspect" size="m" />
          <OnboardingTour
            options={ONBOARDING_FEATURES.BROWSER_PROFILER}
            anchorPosition="upLeft"
            panelClassName={styles.profilerOnboardPanel}
          >
            <Text>Profiler</Text>
          </OnboardingTour>
        </FlexItem>
        {isStarted && (
          <FlexItem direction="row" className={styles.actions}>
            <RiTooltip
              content={
                isErrorShown || isResumeLocked
                  ? ''
                  : !isPaused
                    ? 'Pause'
                    : 'Resume'
              }
              anchorClassName="inline-flex"
            >
              <IconButton
                icon={
                  isErrorShown || isResumeLocked
                    ? BannedIcon
                    : !isPaused
                      ? PauseIcon
                      : PlayIcon
                }
                onClick={() => handleRunMonitor()}
                aria-label="start/stop monitor"
                data-testid="toggle-run-monitor"
                disabled={disabledPause}
              />
            </RiTooltip>
            <RiTooltip
              content={
                !isStarted || !items.length ? '' : 'Clear Profiler Window'
              }
              anchorClassName={cx('inline-flex', {
                transparent: !isStarted || !items.length,
              })}
            >
              <IconButton
                icon={DeleteIcon}
                onClick={handleClearMonitor}
                aria-label="clear profiler"
                data-testid="clear-monitor"
              />
            </RiTooltip>
          </FlexItem>
        )}
        <FlexItem grow />
        <WindowControlGroup
          onClose={handleCloseMonitor}
          onHide={handleHideMonitor}
          id="monitor"
        />
      </Row>
    </div>
  )
}

export default MonitorHeader
