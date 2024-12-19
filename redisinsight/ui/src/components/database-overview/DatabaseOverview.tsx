import React from 'react'
import cx from 'classnames'
import { EuiFlexGroup, EuiFlexItem, EuiIcon, EuiToolTip } from '@elastic/eui'

import { IMetric } from './components/OverviewMetrics'

import AutoRefresh from '../auto-refresh'
import styles from './styles.module.scss'

interface Props {
  metrics?: Array<IMetric>
  loadData: () => void
  lastRefreshTime: number | null
  handleEnableAutoRefresh: (enableAutoRefresh: boolean, refreshRate: string) => void
}

const TIMEOUT_TO_GET_INFO = process.env.NODE_ENV !== 'development' ? 5000 : 60_000
const MINIMUM_INTERVAL_TIME = process.env.RI_DATABASE_OVERVIEW_MINIMUM_REFRESH_INTERVAL

const DatabaseOverview = (props: Props) => {
  const { metrics, loadData, lastRefreshTime, handleEnableAutoRefresh } = props

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
          >
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
            >
              <EuiFlexItem grow={false} className={styles.overviewItemContent}>
                <AutoRefresh
                  displayText={false}
                  displayLastRefresh={false}
                  iconSize="xs"
                  loading={false}
                  lastRefreshTime={lastRefreshTime}
                  containerClassName=""
                  postfix="overview"
                  defaultRefreshRate={TIMEOUT_TO_GET_INFO.toString()}
                  minimumRefreshRate={parseInt(MINIMUM_INTERVAL_TIME || '0')}
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
