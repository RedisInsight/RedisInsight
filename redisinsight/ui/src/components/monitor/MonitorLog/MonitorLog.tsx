import { EuiButton, EuiFlexGroup, EuiFlexItem, EuiIcon, EuiText } from '@elastic/eui'
import { format, formatDuration, intervalToDuration } from 'date-fns'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import AutoSizer from 'react-virtualized-auto-sizer'

import { monitorSelector, resetProfiler, stopMonitor } from 'uiSrc/slices/cli/monitor'
import { cutDurationText } from 'uiSrc/utils'
import { downloadFile } from 'uiSrc/utils/dom/downloadFile'
import { fetchMonitorLog } from 'uiSrc/slices/cli/cli-output'

import styles from './styles.module.scss'

const PADDINGS_OUTSIDE = 12
const MIDDLE_SCREEN_RESOLUTION = 460 - PADDINGS_OUTSIDE
const SMALL_SCREEN_RESOLUTION = 360 - PADDINGS_OUTSIDE
const DOWNLOAD_IFRAME_NAME = 'logFileDownloadIFrame'

const MonitorLog = () => {
  const { timestamp, logFileId, isSaveToFile } = useSelector(monitorSelector)
  const dispatch = useDispatch()

  const duration = cutDurationText(
    formatDuration(
      intervalToDuration({
        end: timestamp.duration,
        start: 0
      })
    )
  )

  const downloadBtnProps: any = {
    target: DOWNLOAD_IFRAME_NAME
  }

  const onResetProfiler = () => {
    dispatch(stopMonitor())
    dispatch(resetProfiler())
  }

  const getPaddingByWidth = (width: number): number => {
    if (width < SMALL_SCREEN_RESOLUTION) return 6
    if (width < MIDDLE_SCREEN_RESOLUTION) return 12
    return 18
  }

  const handleDownloadLog = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()

    dispatch(fetchMonitorLog(logFileId || '', downloadFile))
  }

  return (
    <div className={styles.monitorLogWrapper}>
      <iframe title="downloadIframeTarget" name={DOWNLOAD_IFRAME_NAME} style={{ display: 'none' }} />
      <AutoSizer disableHeight>
        {({ width }) => (
          <div
            className={styles.container}
            style={{ width, paddingLeft: getPaddingByWidth(width), paddingRight: getPaddingByWidth(width) }}
            data-testid="download-log-panel"
          >
            <EuiText size="xs" color="subdued" className={styles.time} data-testid="profiler-running-time">
              <EuiIcon type="clock" />
              {format(timestamp.start, 'hh:mm:ss')}
              &nbsp;&#8211;&nbsp;
              {format(timestamp.paused, 'hh:mm:ss')}
              &nbsp;(
              {duration}
              {width > SMALL_SCREEN_RESOLUTION && ' Running time'}
              )
            </EuiText>
            <EuiFlexGroup
              className={styles.actions}
              gutterSize="none"
              justifyContent="spaceBetween"
              alignItems="center"
              responsive={false}
            >
              <EuiFlexItem grow={false}>
                {isSaveToFile && (
                  <EuiButton
                    size="s"
                    color="secondary"
                    iconType="download"
                    className={styles.btn}
                    data-testid="download-log-btn"
                    onClick={handleDownloadLog}
                    {...downloadBtnProps}
                  >
                    {width > SMALL_SCREEN_RESOLUTION && ' Download '}
                    Log
                  </EuiButton>
                )}
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiButton
                  fill
                  size="s"
                  color="secondary"
                  onClick={onResetProfiler}
                  iconType="refresh"
                  className={styles.btn}
                  data-testid="reset-profiler-btn"
                >
                  Reset
                  {width > SMALL_SCREEN_RESOLUTION && ' Profiler'}
                </EuiButton>
              </EuiFlexItem>
            </EuiFlexGroup>
          </div>
        )}
      </AutoSizer>
    </div>
  )
}

export default MonitorLog
