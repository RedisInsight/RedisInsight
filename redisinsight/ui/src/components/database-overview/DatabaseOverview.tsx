import React from 'react'
import cx from 'classnames'
import { useSelector } from 'react-redux'
import { EuiButton, EuiFlexGroup, EuiFlexItem, EuiIcon, EuiToolTip } from '@elastic/eui'
import { getConfig } from 'uiSrc/config'

import { DATABASE_OVERVIEW_REFRESH_INTERVAL, DATABASE_OVERVIEW_MINIMUM_REFRESH_INTERVAL } from 'uiSrc/constants/browser'
import { connectedInstanceOverviewSelector } from 'uiSrc/slices/instances/instances'
import { IMetric } from './components/OverviewMetrics'

import AutoRefresh from '../auto-refresh'
import styles from './styles.module.scss'

interface Props {
  metrics?: Array<IMetric>
  loadData: () => void
  lastRefreshTime: number | null
  handleEnableAutoRefresh: (enableAutoRefresh: boolean, refreshRate: string) => void
}

const riConfig = getConfig()

const DatabaseOverview = (props: Props) => {
  const overview = useSelector(connectedInstanceOverviewSelector)
  const { metrics, loadData, lastRefreshTime, handleEnableAutoRefresh } = props

  const {
    usedMemoryPercent,
    cloudDetails: { subscriptionType, subscriptionId } = {},
  } = overview

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
        <EuiFlexGroup
          className={styles.commandsPerSecTip}
          key={tooltipItem.id}
          gutterSize="none"
          responsive={false}
          alignItems="center"
        >
          {tooltipItem.icon && (
            <EuiFlexItem grow={false}>
              <EuiIcon
                className={styles.moreInfoOverviewIcon}
                size="m"
                type={tooltipItem.icon}
              />
            </EuiFlexItem>
          )}
          <EuiFlexItem className={styles.moreInfoOverviewContent} grow={false}>
            {tooltipItem.content}
          </EuiFlexItem>
          <EuiFlexItem className={styles.moreInfoOverviewTitle} grow={false}>
            {tooltipItem.title}
          </EuiFlexItem>
        </EuiFlexGroup>
      ))
  }

  return (
    <EuiFlexGroup className={styles.container} gutterSize="none" responsive={false}>
      {metrics?.length! > 0 && (
        <EuiFlexItem key="overview">
          <EuiFlexGroup
            className={cx(
              'flex-row',
              styles.itemContainer,
              styles.overview,
            )}
            gutterSize="none"
            responsive={false}
            alignItems="center"
          >
            {subscriptionId && subscriptionType === 'fixed' && (
              <EuiFlexItem
                className={cx(styles.overviewItem, styles.upgradeBtnItem)}
                grow={false}
                data-testid="overview-auto-refresh"
                style={{ borderRight: 'none' }}
              >
                <EuiButton
                  color="secondary"
                  fill={usedMemoryPercent >= 75}
                  className={cx(styles.upgradeBtn)}
                  onClick={() => {
                    const upgradeUrl = `${riConfig.app.returnUrlBase}/database/upgrade/${subscriptionId}`
                    window.open(upgradeUrl, '_blank')
                  }}
                  data-testid="upgrade-ri-db-button"
                >
                  Upgrade
                </EuiButton>
              </EuiFlexItem>
            )}
            {
              metrics?.map((overviewItem) => (
                <EuiFlexItem
                  className={cx(styles.overviewItem, overviewItem.className ?? '')}
                  key={overviewItem.id}
                  data-test-subj={overviewItem.id}
                  grow={false}
                >
                  <EuiToolTip
                    position="bottom"
                    className={styles.tooltip}
                    content={getTooltipContent(overviewItem)}
                  >
                    <EuiFlexGroup gutterSize="none" responsive={false} alignItems="center" justifyContent="center">
                      {overviewItem.icon && (
                        <EuiFlexItem grow={false} className={styles.icon}>
                          <EuiIcon
                            size="m"
                            type={overviewItem.icon}
                            className={styles.icon}
                          />
                        </EuiFlexItem>
                      )}
                      <EuiFlexItem grow={false} className={styles.overviewItemContent}>
                        {overviewItem.content}
                      </EuiFlexItem>
                    </EuiFlexGroup>
                  </EuiToolTip>
                </EuiFlexItem>
              ))
            }
            <EuiFlexItem
              className={cx(styles.overviewItem, styles.autoRefresh)}
              grow={false}
              data-testid="overview-auto-refresh"
            >
              <EuiFlexItem grow={false} className={styles.overviewItemContent}>
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
                  minimumRefreshRate={parseInt(DATABASE_OVERVIEW_MINIMUM_REFRESH_INTERVAL)}
                  onRefresh={loadData}
                  onEnableAutoRefresh={handleEnableAutoRefresh}
                />
              </EuiFlexItem>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
      )}
    </EuiFlexGroup>
  )
}

export default DatabaseOverview
