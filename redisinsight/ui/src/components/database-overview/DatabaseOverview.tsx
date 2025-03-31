import React, { useContext, useState, useMemo } from 'react'
import cx from 'classnames'
import { useDispatch, useSelector } from 'react-redux'
import { EuiButton, EuiIcon, EuiToolTip } from '@elastic/eui'
import { getConfig } from 'uiSrc/config'

import {
  DATABASE_OVERVIEW_REFRESH_INTERVAL,
  DATABASE_OVERVIEW_MINIMUM_REFRESH_INTERVAL,
} from 'uiSrc/constants/browser'
import {
  connectedInstanceOverviewSelector,
  connectedInstanceSelector,
  getDatabaseConfigInfoAction,
} from 'uiSrc/slices/instances/instances'
import { ThemeContext } from 'uiSrc/contexts/themeContext'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { toBytes, truncatePercentage } from 'uiSrc/utils'
import { FlexItem, Row } from 'uiSrc/components/base/layout/Flex'
import { getOverviewMetrics, IMetric } from './components/OverviewMetrics'

import AutoRefresh from '../auto-refresh'
import styles from './styles.module.scss'

const riConfig = getConfig()

const getTooltipContent = (metric: IMetric) => {
  if (!metric.children?.length) {
    return (
      <>
        <span>{metric.tooltip.content}</span>
        &nbsp;
        <span>{metric.tooltip.title}</span>
      </>
    )
  }
  return metric.children
    .filter((item) => item.value !== undefined)
    .map((tooltipItem) => (
      <Row
        className={styles.commandsPerSecTip}
        key={tooltipItem.id}
        align="center"
      >
        {tooltipItem.icon && (
          <FlexItem>
            <EuiIcon
              className={styles.moreInfoOverviewIcon}
              size="m"
              type={tooltipItem.icon}
            />
          </FlexItem>
        )}
        <FlexItem className={styles.moreInfoOverviewContent}>
          {tooltipItem.content}
        </FlexItem>
        <FlexItem className={styles.moreInfoOverviewTitle}>
          {tooltipItem.title}
        </FlexItem>
      </Row>
    ))
}

const DatabaseOverview = () => {
  const { theme } = useContext(ThemeContext)
  const dispatch = useDispatch()
  const [lastRefreshTime, setLastRefreshTime] = useState<number | null>(null)
  const { id: connectedInstanceId = '', db } = useSelector(
    connectedInstanceSelector,
  )

  const overview = useSelector(connectedInstanceOverviewSelector)
  const {
    usedMemory,
    cloudDetails: {
      subscriptionType,
      subscriptionId,
      planMemoryLimit,
      memoryLimitMeasurementUnit,
      isBdbPackages,
    } = {},
  } = overview

  const loadData = () => {
    if (connectedInstanceId) {
      dispatch(getDatabaseConfigInfoAction(connectedInstanceId))
      setLastRefreshTime(Date.now())
    }
  }

  const handleEnableAutoRefresh = (
    enableAutoRefresh: boolean,
    refreshRate: string,
  ) => {
    sendEventTelemetry({
      event: enableAutoRefresh
        ? TelemetryEvent.OVERVIEW_AUTO_REFRESH_ENABLED
        : TelemetryEvent.OVERVIEW_AUTO_REFRESH_DISABLED,
      eventData: {
        databaseId: connectedInstanceId,
        refreshRate: +refreshRate,
      },
    })
  }

  const usedMemoryPercent = planMemoryLimit
    ? parseFloat(
        `${truncatePercentage(((usedMemory || 0) / toBytes(planMemoryLimit, memoryLimitMeasurementUnit || 'MB')) * 100, 1)}`,
      )
    : undefined

  const metrics = useMemo(() => {
    const overviewItems = {
      ...overview,
      usedMemoryPercent,
    }
    return getOverviewMetrics({ theme, items: overviewItems, db })
  }, [theme, overview, db, usedMemoryPercent])

  return (
    <Row className={styles.container}>
      {metrics?.length! > 0 && (
        <FlexItem grow key="overview">
          <Row
            className={cx('flex-row', styles.itemContainer, styles.overview)}
            align="center"
          >
            {subscriptionId && subscriptionType === 'fixed' && (
              <FlexItem
                className={cx(styles.overviewItem, styles.upgradeBtnItem)}
                style={{ borderRight: 'none' }}
              >
                <EuiButton
                  color="secondary"
                  fill={!!usedMemoryPercent && usedMemoryPercent >= 75}
                  className={cx(styles.upgradeBtn)}
                  style={{ fontWeight: '400' }}
                  onClick={() => {
                    const upgradeUrl = isBdbPackages
                      ? `${riConfig.app.returnUrlBase}/databases/upgrade/${subscriptionId}`
                      : `${riConfig.app.returnUrlBase}/subscription/${subscriptionId}/change-plan`
                    window.open(upgradeUrl, '_blank')
                  }}
                  data-testid="upgrade-ri-db-button"
                >
                  Upgrade plan
                </EuiButton>
              </FlexItem>
            )}
            {metrics?.map((overviewItem) => (
              <FlexItem
                className={cx(
                  styles.overviewItem,
                  overviewItem.className ?? '',
                )}
                key={overviewItem.id}
                data-test-subj={overviewItem.id}
              >
                <EuiToolTip
                  position="bottom"
                  className={styles.tooltip}
                  content={getTooltipContent(overviewItem)}
                >
                  <Row align="center" justify="center">
                    {overviewItem.icon && (
                      <FlexItem className={styles.icon}>
                        <EuiIcon
                          size="m"
                          type={overviewItem.icon}
                          className={styles.icon}
                        />
                      </FlexItem>
                    )}
                    <FlexItem className={styles.overviewItemContent}>
                      {overviewItem.content}
                    </FlexItem>
                  </Row>
                </EuiToolTip>
              </FlexItem>
            ))}
            <FlexItem
              className={cx(styles.overviewItem, styles.autoRefresh)}
              data-testid="overview-auto-refresh"
            >
              <FlexItem className={styles.overviewItemContent}>
                <AutoRefresh
                  displayText={false}
                  displayLastRefresh={false}
                  iconSize="xs"
                  loading={false}
                  enableAutoRefreshDefault
                  lastRefreshTime={lastRefreshTime}
                  containerClassName=""
                  postfix="overview"
                  testid="auto-refresh-overview"
                  defaultRefreshRate={DATABASE_OVERVIEW_REFRESH_INTERVAL}
                  minimumRefreshRate={parseInt(
                    DATABASE_OVERVIEW_MINIMUM_REFRESH_INTERVAL,
                  )}
                  onRefresh={loadData}
                  onEnableAutoRefresh={handleEnableAutoRefresh}
                />
              </FlexItem>
            </FlexItem>
          </Row>
        </FlexItem>
      )}
    </Row>
  )
}

export default DatabaseOverview
