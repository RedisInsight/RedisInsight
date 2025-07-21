import React, { useState } from 'react'
import cx from 'classnames'
import AutoSizer from 'react-virtualized-auto-sizer'

import { IMonitorDataPayload } from 'uiSrc/slices/interfaces'

import { RiTooltip } from 'uiSrc/components'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { PlayFilledIcon } from 'uiSrc/components/base/icons'
import { ColorText } from 'uiSrc/components/base/text'
import { SwitchInput } from 'uiSrc/components/base/inputs'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
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
    handleRunMonitor = () => {},
  } = props
  const [saveLogValue, setSaveLogValue] = useState(isSaveToFile)

  const MonitorNotStarted = () => (
    <div className={styles.startContainer} data-testid="monitor-not-started">
      <div className={styles.startContent}>
        <RiTooltip content="Start">
          <IconButton
            icon={PlayFilledIcon}
            className={styles.startTitleIcon}
            onClick={() => handleRunMonitor(saveLogValue)}
            aria-label="start monitor"
            data-testid="start-monitor"
          />
        </RiTooltip>
        <div className={styles.startTitle}>Start Profiler</div>
        <Row style={{ flexGrow: 0 }}>
          <FlexItem>
            <RiIcon
              className={cx(styles.iconWarning, 'warning--light')}
              type="ToastDangerIcon"
              size="m"
              color="attention600"
              aria-label="alert icon"
              style={{ paddingTop: 2 }}
            />
          </FlexItem>
          <FlexItem>
            <ColorText
              color="warning"
              className="warning--light"
              style={{ paddingLeft: 4 }}
              data-testid="monitor-warning-message"
            >
              Running Profiler will decrease throughput, avoid running it in
              production databases.
            </ColorText>
          </FlexItem>
        </Row>
      </div>
      <div className={styles.saveLogContainer} data-testid="save-log-container">
        <RiTooltip
          title="Allows you to download the generated log file after pausing the Profiler"
          content="Profiler log is saved to a file on your local machine with no size limitation.
          The temporary log file will be automatically rewritten when the Profiler is reset."
          data-testid="save-log-tooltip"
        >
          <SwitchInput
            title="Save Log"
            checked={saveLogValue}
            onCheckedChange={setSaveLogValue}
            data-testid="save-log-switch"
          />
        </RiTooltip>
      </div>
    </div>
  )

  const MonitorError = () => (
    <div className={styles.startContainer} data-testid="monitor-error">
      <div className={cx(styles.startContent, styles.startContentError)}>
        <Row>
          <FlexItem>
            <RiIcon
              type="BannedIcon"
              size="m"
              color="danger"
              aria-label="no permissions icon"
            />
          </FlexItem>
          <FlexItem grow>
            <ColorText
              color="danger"
              style={{ paddingLeft: 4 }}
              data-testid="monitor-error-message"
            >
              {error}
            </ColorText>
          </FlexItem>
        </Row>
      </div>
    </div>
  )

  return (
    <>
      <div
        className={cx(styles.container, {
          [styles.isRunning]: isRunning && !isPaused,
        })}
        data-testid="monitor"
      >
        {error && !isRunning ? (
          <MonitorError />
        ) : (
          <>
            {!isStarted && <MonitorNotStarted />}
            {!items?.length && isRunning && !isPaused && (
              <div
                data-testid="monitor-started"
                style={{ paddingTop: 10, paddingLeft: 12 }}
              >
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
        {isStarted && isPaused && <MonitorLog />}
      </div>
    </>
  )
}

export default React.memo(Monitor)
