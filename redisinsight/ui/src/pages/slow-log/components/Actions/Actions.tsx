import {
  EuiButton,
  EuiButtonIcon,
  EuiIcon,
  EuiPopover,
  EuiText,
  EuiToolTip,
} from '@elastic/eui'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { DurationUnits } from 'uiSrc/constants'
import { slowLogSelector } from 'uiSrc/slices/analytics/slowlog'
import { AutoRefresh } from 'uiSrc/components'
import { Nullable } from 'uiSrc/utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { FlexItem, Row } from 'uiSrc/components/base/layout/Flex'
import { Spacer } from 'uiSrc/components/base/layout/Spacer'
import SlowLogConfig from '../SlowLogConfig'
import styles from './styles.module.scss'

export interface Props {
  width: number
  isEmptySlowLog: boolean
  durationUnit: Nullable<DurationUnits>
  onClear: () => void
  onRefresh: (maxLen?: number) => void
}

const HIDE_REFRESH_LABEL_WIDTH = 850

const Actions = (props: Props) => {
  const {
    isEmptySlowLog,
    durationUnit,
    width,
    onClear = () => {},
    onRefresh,
  } = props
  const { instanceId } = useParams<{ instanceId: string }>()
  const { name = '' } = useSelector(connectedInstanceSelector)
  const { loading, lastRefreshTime } = useSelector(slowLogSelector)

  const [isPopoverClearOpen, setIsPopoverClearOpen] = useState(false)
  const [isPopoverConfigOpen, setIsPopoverConfigOpen] = useState(false)

  const showClearPopover = () => {
    setIsPopoverClearOpen((isPopoverClearOpen) => !isPopoverClearOpen)
  }

  const closePopoverClear = () => {
    setIsPopoverClearOpen(false)
  }
  const showConfigPopover = () => {
    setIsPopoverConfigOpen((isPopoverConfigOpen) => !isPopoverConfigOpen)
  }

  const closePopoverConfig = () => {
    setIsPopoverConfigOpen(false)
  }

  const handleClearClick = () => {
    onClear()
    closePopoverClear()
  }

  const handleEnableAutoRefresh = (
    enableAutoRefresh: boolean,
    refreshRate: string,
  ) => {
    sendEventTelemetry({
      event: enableAutoRefresh
        ? TelemetryEvent.SLOWLOG_AUTO_REFRESH_ENABLED
        : TelemetryEvent.SLOWLOG_AUTO_REFRESH_DISABLED,
      eventData: {
        databaseId: instanceId,
        refreshRate: enableAutoRefresh ? +refreshRate : undefined,
      },
    })
  }

  const handleChangeAutoRefreshRate = (
    enableAutoRefresh: boolean,
    refreshRate: string,
  ) => {
    if (enableAutoRefresh) {
      sendEventTelemetry({
        event: TelemetryEvent.SLOWLOG_AUTO_REFRESH_ENABLED,
        eventData: {
          databaseId: instanceId,
          refreshRate: +refreshRate,
        },
      })
    }
  }

  const ToolTipContent = (
    <div className={styles.popoverContainer}>
      <EuiIcon type="alert" color="danger" className={styles.warningIcon} />
      <div>
        <EuiText size="m">
          <h4 className={styles.popoverTitle}>
            <b>Clear Slow Log?</b>
          </h4>
          <EuiText size="xs" color="subdued">
            Slow Log will be cleared for&nbsp;
            <span className={styles.popoverDBName}>{name}</span>
            <br />
            NOTE: This is server configuration
          </EuiText>
        </EuiText>
        <div className={styles.popoverFooter}>
          <EuiButton
            fill
            size="s"
            color="warning"
            iconType="eraser"
            onClick={() => handleClearClick()}
            className={styles.popoverDeleteBtn}
            data-testid="reset-confirm-btn"
          >
            Clear
          </EuiButton>
        </div>
      </div>
    </div>
  )

  return (
    <Row className={styles.actions} gap="s" align="center">
      <FlexItem grow={5} style={{ alignItems: 'flex-end' }}>
        <AutoRefresh
          postfix="slowlog"
          loading={loading}
          displayText={width > HIDE_REFRESH_LABEL_WIDTH}
          lastRefreshTime={lastRefreshTime}
          containerClassName={styles.refreshContainer}
          onRefresh={() => onRefresh()}
          onEnableAutoRefresh={handleEnableAutoRefresh}
          onChangeAutoRefreshRate={handleChangeAutoRefreshRate}
          testid="slowlog"
        />
      </FlexItem>
      <FlexItem grow>
        <EuiPopover
          ownFocus
          anchorPosition="downRight"
          isOpen={isPopoverConfigOpen}
          panelPaddingSize="m"
          closePopover={() => {}}
          panelClassName={cx('popover-without-top-tail', styles.configWrapper)}
          button={
            <EuiButton
              size="s"
              iconType="gear"
              color="secondary"
              aria-label="Configure"
              onClick={() => showConfigPopover()}
              data-testid="configure-btn"
            >
              Configure
            </EuiButton>
          }
        >
          <SlowLogConfig
            closePopover={closePopoverConfig}
            onRefresh={onRefresh}
          />
        </EuiPopover>
      </FlexItem>
      {!isEmptySlowLog && (
        <FlexItem grow>
          <EuiPopover
            anchorPosition="leftCenter"
            ownFocus
            isOpen={isPopoverClearOpen}
            closePopover={closePopoverClear}
            panelPaddingSize="m"
            button={
              <EuiToolTip
                position="left"
                anchorClassName={styles.icon}
                content="Clear Slow Log"
              >
                <EuiButtonIcon
                  iconType="eraser"
                  color="primary"
                  aria-label="Clear Slow Log"
                  onClick={() => showClearPopover()}
                  data-testid="clear-btn"
                />
              </EuiToolTip>
            }
          >
            {ToolTipContent}
          </EuiPopover>
        </FlexItem>
      )}
      <FlexItem grow>
        <EuiToolTip
          title="Slow Log"
          position="bottom"
          anchorClassName={styles.icon}
          content={
            <span data-testid="slowlog-tooltip-text">
              Slow Log is a list of slow operations for your Redis instance.
              These can be used to troubleshoot performance issues.
              <Spacer size="xs" />
              Each entry in the list displays the command, duration and
              timestamp. Any transaction that exceeds{' '}
              <b>slowlog-log-slower-than</b> {durationUnit} are recorded up to a
              maximum of <b>slowlog-max-len</b> after which older entries are
              discarded.
            </span>
          }
        >
          <EuiIcon
            className={styles.infoIcon}
            type="iInCircle"
            style={{ cursor: 'pointer' }}
            data-testid="slow-log-tooltip-icon"
          />
        </EuiToolTip>
      </FlexItem>
    </Row>
  )
}

export default Actions
