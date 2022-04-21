import { EuiButton, EuiFlexGroup, EuiFlexItem, EuiIcon, EuiText, EuiToolTip } from '@elastic/eui'
import { format, formatDuration, intervalToDuration } from 'date-fns'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import AutoSizer from 'react-virtualized-auto-sizer'
import { ApiEndpoints } from 'uiSrc/constants'
import { AppEnv } from 'uiSrc/constants/env'
import { monitorSelector, resetProfiler, stopMonitor } from 'uiSrc/slices/cli/monitor'
import { cutDurationText, getBaseApiUrl } from 'uiSrc/utils'

import styles from './styles.module.scss'

const PADDINGS_OUTSIDE = 12
const MIDDLE_SCREEN_RESOLUTION = 460 - PADDINGS_OUTSIDE
const SMALL_SCREEN_RESOLUTION = 360 - PADDINGS_OUTSIDE

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
  const baseApiUrl = getBaseApiUrl()
  const linkToDownload = `${baseApiUrl}/api/${ApiEndpoints.PROFILER_LOGS}/${logFileId}`
  const isElectron = process.env.APP_ENV === AppEnv.ELECTRON

  const downloadBtnProps: any = {}
  if (isElectron) {
    downloadBtnProps.download = true
  } else {
    downloadBtnProps.target = '_blank'
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

  return (
    <div className={styles.monitorLogWrapper}>
      <AutoSizer disableHeight>
        {({ width }) => (
          <div
            className={styles.container}
            style={{ width, paddingLeft: getPaddingByWidth(width), paddingRight: getPaddingByWidth(width) }}
          >
            <EuiText size="xs" color="subdued" className={styles.time}>
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
                  <EuiToolTip
                    content="Download Profiler Log"
                  >
                    <EuiButton
                      size="s"
                      color="secondary"
                      href={linkToDownload}
                      iconType="download"
                      className={styles.btn}
                      data-testid="download-log-btn"
                      {...downloadBtnProps}
                    >
                      {width > SMALL_SCREEN_RESOLUTION && ' Download '}
                      Log
                    </EuiButton>
                  </EuiToolTip>
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
