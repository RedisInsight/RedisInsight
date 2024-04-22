import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiButtonIcon,
  EuiText,
  EuiToolTip,
  EuiIcon,
} from '@elastic/eui'

import {
  monitorSelector,
  resetMonitorItems,
  setMonitorInitialState,
  toggleHideMonitor,
  toggleMonitor,
} from 'uiSrc/slices/cli/monitor'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import BanIcon from 'uiSrc/assets/img/monitor/ban.svg'
import { OnboardingTour } from 'uiSrc/components'
import { ONBOARDING_FEATURES } from 'uiSrc/components/onboarding-features'

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
    loadingPause
  } = useSelector(monitorSelector)
  const isErrorShown = !!error && !isRunning
  const disabledPause = isErrorShown || isResumeLocked || loadingPause
  const dispatch = useDispatch()

  const handleCloseMonitor = () => {
    if (isRunning) {
      sendEventTelemetry({
        event: TelemetryEvent.PROFILER_STOPPED,
        eventData: { databaseId: instanceId }
      })
    }
    sendEventTelemetry({
      event: TelemetryEvent.PROFILER_CLOSED,
      eventData: { databaseId: instanceId }
    })
    dispatch(setMonitorInitialState())
  }

  const handleHideMonitor = () => {
    sendEventTelemetry({
      event: TelemetryEvent.PROFILER_MINIMIZED,
      eventData: { databaseId: instanceId }
    })

    dispatch(toggleMonitor())
    dispatch(toggleHideMonitor())
  }

  const handleClearMonitor = () => {
    sendEventTelemetry({
      event: TelemetryEvent.PROFILER_CLEARED,
      eventData: { databaseId: instanceId }
    })
    dispatch(resetMonitorItems())
  }

  return (
    <div className={styles.container} data-testid="monitor-header">
      <EuiFlexGroup
        justifyContent="spaceBetween"
        gutterSize="none"
        alignItems="center"
        responsive={false}
        style={{ height: '100%' }}
      >
        <EuiFlexItem grow={false} className={styles.title}>
          <EuiIcon type="inspect" size="m" />
          <OnboardingTour
            options={ONBOARDING_FEATURES.BROWSER_PROFILER}
            anchorPosition="upLeft"
            panelClassName={styles.profilerOnboardPanel}
          >
            <EuiText>Profiler</EuiText>
          </OnboardingTour>
        </EuiFlexItem>
        {isStarted && (
          <EuiFlexItem grow={false} className={styles.actions}>
            <EuiToolTip
              content={(isErrorShown || isResumeLocked) ? '' : (!isPaused ? 'Pause' : 'Resume')}
              anchorClassName="inline-flex"
            >
              <EuiButtonIcon
                iconType={(isErrorShown || isResumeLocked) ? BanIcon : (!isPaused ? 'pause' : 'play')}
                onClick={() => handleRunMonitor()}
                aria-label="start/stop monitor"
                data-testid="toggle-run-monitor"
                disabled={disabledPause}
              />
            </EuiToolTip>
            <EuiToolTip
              content={!isStarted || !items.length ? '' : 'Clear Profiler Window'}
              anchorClassName={cx('inline-flex', { transparent: !isStarted || !items.length })}
            >
              <EuiButtonIcon
                iconType="eraser"
                onClick={handleClearMonitor}
                aria-label="clear profiler"
                data-testid="clear-monitor"
              />
            </EuiToolTip>
          </EuiFlexItem>
        )}
        <EuiFlexItem grow />
        <EuiFlexItem grow={false}>
          <EuiToolTip
            content="Minimize"
            position="top"
            display="inlineBlock"
            anchorClassName="flex-row"
          >
            <EuiButtonIcon
              iconType="minus"
              color="primary"
              id="hide-monitor"
              aria-label="hide monitor"
              data-testid="hide-monitor"
              className={styles.icon}
              onClick={handleHideMonitor}
            />
          </EuiToolTip>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiToolTip
            content="Close"
            position="top"
            display="inlineBlock"
            anchorClassName="flex-row"
          >
            <EuiButtonIcon
              iconType="cross"
              color="primary"
              id="close-monitor"
              aria-label="close monitor"
              data-testid="close-monitor"
              className={styles.icon}
              onClick={handleCloseMonitor}
            />
          </EuiToolTip>
        </EuiFlexItem>
      </EuiFlexGroup>
    </div>
  )
}

export default MonitorHeader
