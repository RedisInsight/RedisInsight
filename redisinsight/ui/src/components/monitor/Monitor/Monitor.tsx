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
        <>
          {i === 0 && (
            <span className={cx(styles.itemCommandFirst)} key={`${arg + i}`}>{`"${arg}"`}</span>
          )}
          { i !== 0 && ` "${arg}"`}
        </>
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
            <EuiTextColor color="danger" style={{ paddingLeft: 4 }}>
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

        {isStarted && (
        <div className={styles.content} ref={monitorRef} onWheel={onWheel}>

          {items.map((item) => (
            <div className={styles.item} key={!item?.isError ? (item?.time + item?.args?.toString() ?? '') : Date.now()}>
              {!item?.isError && (
              <EuiFlexGroup responsive={false}>
                <EuiFlexItem grow={false} className={styles.itemTime}>
                  {getFormatTime(item?.time)}
                </EuiFlexItem>
                <EuiFlexItem grow={false} className={styles.itemSource} style={{ paddingRight: 10 }}>
                  {`[${item?.database} ${item?.source}]`}
                </EuiFlexItem>
                <EuiFlexItem>
                  {getArgs(item?.args)}
                </EuiFlexItem>
              </EuiFlexGroup>
              )}
              {item?.isError && (
              <EuiFlexGroup>
                <EuiFlexItem>
                  <EuiTextColor color="danger">{item?.message ?? DEFAULT_TEXT}</EuiTextColor>
                </EuiFlexItem>
              </EuiFlexGroup>
              )}
            </div>
          ))}

          {!items?.length && isRunning && <span data-testid="monitor-started">Monitor is started.</span>}
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
