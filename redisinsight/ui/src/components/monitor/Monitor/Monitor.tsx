import React, { useState } from 'react'
import cx from 'classnames'
import {
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiSwitch,
  EuiTextColor,
  EuiToolTip,
} from '@elastic/eui'
import AutoSizer from 'react-virtualized-auto-sizer'

import { IMonitorDataPayload } from 'uiSrc/slices/interfaces'
import { ReactComponent as BanIcon } from 'uiSrc/assets/img/monitor/ban.svg'

import MonitorLog from '../MonitorLog'
import MonitorOutputList from '../MonitorOutputList'

import styles from './styles.module.scss'

export interface Props {
  items: IMonitorDataPayload[]
  error: string
  isStarted: boolean
  isRunning: boolean
  isPaused: boolean
  isShowHelper: boolean
  isSaveToFile: boolean
  isShowCli: boolean
  handleRunMonitor: (isSaveToLog?: boolean) => void
}

const Monitor = (props: Props) => {
  const {
    items = [],
    error = '',
    isRunning = false,
    isStarted = false,
    isPaused = false,
    isShowHelper = false,
    isShowCli = false,
    isSaveToFile = false,
    handleRunMonitor = () => {}
  } = props
  const [saveLogValue, setSaveLogValue] = useState(isSaveToFile)

  const MonitorNotStarted = () => (
    <div className={styles.startContainer} data-testid="monitor-not-started">
      <div className={styles.startContent}>
        <EuiToolTip
          content="Start"
          display="inlineBlock"
        >
          <EuiButtonIcon
            iconType="playFilled"
            className={styles.startTitleIcon}
            size="m"
            onClick={() => handleRunMonitor(saveLogValue)}
            aria-label="start monitor"
            data-testid="start-monitor"
          />
        </EuiToolTip>
        <div className={styles.startTitle}>Start Profiler</div>
        <EuiFlexGroup responsive={false} style={{ flexGrow: 0 }} gutterSize="none">
          <EuiFlexItem grow={false}>
            <EuiIcon
              className={cx(styles.iconWarning, 'warning--light')}
              type="alert"
              size="m"
              color="warning"
              aria-label="alert icon"
              style={{ paddingTop: 2 }}
            />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiTextColor color="warning" className="warning--light" style={{ paddingLeft: 4 }} data-testid="monitor-warning-message">
              Running Profiler will decrease throughput, avoid running it in production databases.
            </EuiTextColor>
          </EuiFlexItem>
        </EuiFlexGroup>
      </div>
      <div className={styles.saveLogContainer} data-testid="save-log-container">
        <EuiToolTip
          title="Allows you to download the generated log file after pausing the Profiler"
          content="Profiler log is saved to a file on your local machine with no size limitation.
          The temporary log file will be automatically rewritten when the Profiler is reset."
          data-testid="save-log-tooltip"
        >
          <EuiSwitch
            compressed
            label={<span>Save Log</span>}
            checked={saveLogValue}
            onChange={(e) => setSaveLogValue(e.target.checked)}
            data-testid="save-log-switch"
          />
        </EuiToolTip>
      </div>
    </div>
  )

  const MonitorError = () => (
    <div className={styles.startContainer} data-testid="monitor-error">
      <div className={cx(styles.startContent, styles.startContentError)}>
        <EuiFlexGroup responsive={false} gutterSize="none">
          <EuiFlexItem grow={false}>
            <EuiIcon
              type={BanIcon}
              size="m"
              color="danger"
              aria-label="no permissions icon"
            />
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiTextColor color="danger" style={{ paddingLeft: 4 }} data-testid="monitor-error-message">
              { error }
            </EuiTextColor>
          </EuiFlexItem>
        </EuiFlexGroup>
      </div>
    </div>
  )

  return (
    <>
      <div className={cx(styles.container, { [styles.isRunning]: isRunning && !isPaused })} data-testid="monitor">
        {(error && !isRunning)
          ? (<MonitorError />)
          : (
            <>
              {!isStarted && <MonitorNotStarted />}
              {!items?.length && isRunning && !isPaused && (
                <div data-testid="monitor-started" style={{ paddingTop: 10, paddingLeft: 12 }}>
                  Profiler is started.
                </div>
              )}
            </>
          )}
        {isStarted && (
          <div className={styles.content}>
            {!!items?.length && (
              <AutoSizer>
                {({ width, height }) => (
                  <MonitorOutputList
                    width={width || 0}
                    height={height || 0}
                    items={items}
                    compressed={isShowCli || isShowHelper}
                  />
                )}
              </AutoSizer>
            )}
          </div>
        )}
        {(isStarted && isPaused) && (
          <MonitorLog />
        )}
      </div>
    </>
  )
}

export default React.memo(Monitor)
