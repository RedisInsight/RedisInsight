import React, { useEffect } from 'react'
import cx from 'classnames'
import { EuiBadge, EuiFlexGroup, EuiFlexItem, EuiIcon } from '@elastic/eui'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import {
  toggleCli,
  toggleCliHelper,
  cliSettingsSelector,
  clearSearchingCommand,
  setCliEnteringCommand,
  toggleHideCliHelper,
} from 'uiSrc/slices/cli/cli-settings'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { monitorSelector, toggleHideMonitor, toggleMonitor } from 'uiSrc/slices/cli/monitor'

import styles from '../../styles.module.scss'

const BottomGroupMinimized = () => {
  const { instanceId = '' } = useParams<{ instanceId: string }>()
  const {
    isShowCli,
    cliClientUuid,
    isShowHelper,
    isMinimizedHelper,
  } = useSelector(cliSettingsSelector)
  const {
    isShowMonitor,
    isMinimizedMonitor,
  } = useSelector(monitorSelector)
  const dispatch = useDispatch()

  useEffect(() =>
    () => {
      dispatch(clearSearchingCommand())
      dispatch(setCliEnteringCommand())
    }, [])

  const handleExpandCli = () => {
    sendEventTelemetry({
      event: isShowCli ? TelemetryEvent.CLI_MINIMIZED : TelemetryEvent.CLI_OPENED,
      eventData: {
        databaseId: instanceId
      }
    })
    dispatch(toggleCli())
  }

  const handleExpandHelper = () => {
    sendEventTelemetry({
      event: isShowHelper ? TelemetryEvent.COMMAND_HELPER_MINIMIZED : TelemetryEvent.COMMAND_HELPER_OPENED,
      eventData: {
        databaseId: instanceId
      }
    })
    isMinimizedHelper && dispatch(toggleHideCliHelper())
    dispatch(toggleCliHelper())
  }

  const handleExpandMonitor = () => {
    isMinimizedMonitor && dispatch(toggleHideMonitor())
    dispatch(toggleMonitor())
  }

  return (
    <div className={styles.containerMinimized}>
      <EuiFlexGroup
        gutterSize="none"
        alignItems="center"
        responsive={false}
        style={{ height: '100%' }}
      >
        <EuiFlexItem
          className={styles.componentBadgeItem}
          grow={false}
          onClick={handleExpandCli}
          data-testid="expand-cli"
        >
          <EuiBadge className={cx(styles.componentBadge, { [styles.active]: isShowCli || cliClientUuid })}>
            <EuiIcon type="console" size="m" />
            <span>CLI</span>
          </EuiBadge>
        </EuiFlexItem>
        <EuiFlexItem
          className={styles.componentBadgeItem}
          grow={false}
          onClick={handleExpandHelper}
          data-testid="expand-command-helper"
        >
          <EuiBadge className={cx(
            styles.componentBadge,
            { [styles.active]: isShowHelper || isMinimizedHelper }
          )}
          >
            <EuiIcon type="documents" size="m" />
            <span>Command Helper</span>
          </EuiBadge>
        </EuiFlexItem>
        <EuiFlexItem
          className={styles.componentBadgeItem}
          grow={false}
          onClick={handleExpandMonitor}
          data-testid="expand-monitor"
        >
          <EuiBadge className={cx(
            styles.componentBadge,
            { [styles.active]: isShowMonitor || isMinimizedMonitor }
          )}
          >
            <EuiIcon type="inspect" size="m" />
            <span>Monitor</span>
          </EuiBadge>
        </EuiFlexItem>
      </EuiFlexGroup>
    </div>
  )
}

export default BottomGroupMinimized
