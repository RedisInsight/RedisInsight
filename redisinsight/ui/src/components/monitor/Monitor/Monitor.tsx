import React, { Ref, useEffect, useRef, useState } from 'react'
import cx from 'classnames'
import {
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiTextColor,
  EuiToolTip,
} from '@elastic/eui'

import { getFormatTime } from 'uiSrc/utils'
import { DEFAULT_TEXT } from 'uiSrc/components/notifications'
import { IMonitorDataPayload } from 'uiSrc/slices/interfaces'

import styles from './styles.module.scss'

export interface Props {
  items: IMonitorDataPayload[]
  isStarted: boolean
  isRunning: boolean
  isShowHelper: boolean
  isShowCli: boolean
  scrollViewOnAppear: boolean
  handleRunMonitor: () => void
}

const Monitor = (props: Props) => {
  const {
    items = [],
    isRunning = false,
    isStarted = false,
    isShowHelper = false,
    isShowCli = false,
    handleRunMonitor = () => {}
  } = props

  const [autoScroll, setAutoScroll] = useState(true)

  const monitorRef: Ref<HTMLDivElement> = useRef(null)

  const onWheel = () => {
    const { current } = monitorRef

    if (current) {
      const HORIZONTAL_SCROLL_WIDTH = 16
      const horizontalScroll = current.scrollWidth - current.clientWidth
      const currentScrollHeight = current.scrollHeight + (horizontalScroll && HORIZONTAL_SCROLL_WIDTH)

      setAutoScroll(current.scrollTop + current.offsetHeight === currentScrollHeight)
    }
  }

  const scrollToBottom = () => {
    const { current } = monitorRef

    if (current) {
      current.scrollTop = current.scrollHeight
    }
  }

  useEffect(() => {
    if (items.length === 0) {
      setAutoScroll(true)
    }

    if (autoScroll) {
      scrollToBottom()
    }
  }, [items, monitorRef, isRunning, autoScroll])

  const getArgs = (args: string[]): JSX.Element => (
    <div className={cx(styles.itemArgs, { [styles.itemArgs__compressed]: isShowCli || isShowHelper })}>
      {args?.map((arg, i) => (
        <span key={`${arg + i}`}>
          {i === 0 && (
            <span className={cx(styles.itemCommandFirst)}>{`"${arg}"`}</span>
          )}
          { i !== 0 && ` "${arg}"`}
        </span>
      ))}
    </div>
  )

  const MonitorNotStarted = () => (
    <div className={styles.startContainer} data-testid="monitor-not-started">
      <div className={styles.startContent}>
        <EuiToolTip
          content="Start"
          display="inlineBlock"
        >
          <EuiButtonIcon
            iconType="play"
            className={styles.startTitleIcon}
            size="m"
            onClick={handleRunMonitor}
            aria-label="start monitor"
            data-testid="start-monitor"
          />
        </EuiToolTip>
        <div className={styles.startTitle}>Start monitor</div>
        <EuiFlexGroup responsive={false}>
          <EuiFlexItem grow={false}>
            <EuiIcon
              type="alert"
              size="m"
              color="danger"
              aria-label="alert icon"
              style={{ paddingTop: 2 }}
            />
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiTextColor color="danger" style={{ paddingLeft: 4 }} data-testid="monitor-warning-message">
              Running Monitor will decrease throughput, avoid running it in production databases
            </EuiTextColor>
          </EuiFlexItem>
        </EuiFlexGroup>
      </div>
    </div>
  )

  return (
    <>
      <div className={styles.container} data-testid="monitor">
        {(!isStarted || (!isRunning && !items?.length)) && <MonitorNotStarted />}
        {!items?.length && isRunning && <div data-testid="monitor-started" style={{ paddingTop: 10 }}>Monitor is started.</div>}

        {isStarted && !!items?.length && (
          <div className={styles.content} ref={monitorRef} onWheel={onWheel}>

            {items.map(({ time = '', args = [], database = '', source = '', isError, message = '' }) => (
              <div className={styles.item} key={time + args?.toString() ?? ''}>
                {!isError && (
                <EuiFlexGroup responsive={false}>
                  <EuiFlexItem grow={false} className={styles.itemTime}>
                    {getFormatTime(time)}
                  </EuiFlexItem>
                  <EuiFlexItem grow={false} className={styles.itemSource} style={{ paddingRight: 10 }}>
                    {`[${database} ${source}]`}
                  </EuiFlexItem>
                  <EuiFlexItem>
                    {getArgs(args)}
                  </EuiFlexItem>
                </EuiFlexGroup>
                )}
                {isError && (
                <EuiFlexGroup>
                  <EuiFlexItem>
                    <EuiTextColor color="danger">{message ?? DEFAULT_TEXT}</EuiTextColor>
                  </EuiFlexItem>
                </EuiFlexGroup>
                )}
              </div>
            ))}

            {!!items?.length && !isRunning && (
              <span data-testid="monitor-stopped">
                <br />
                Monitor is stopped.
              </span>
            )}
          </div>
        )}
      </div>
    </>
  )
}

export default React.memo(Monitor)
