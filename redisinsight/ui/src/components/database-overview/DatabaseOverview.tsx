import React from 'react'
import cx from 'classnames'
import { EuiFlexGroup, EuiFlexItem, EuiIcon, EuiToolTip } from '@elastic/eui'

import { IMetric } from './components/OverviewMetrics'

import styles from './styles.module.scss'

interface Props {
  metrics?: Array<IMetric>
}

const DatabaseOverview = (props: Props) => {
  const { metrics } = props

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
          <div className={cx(
            'flex-row',
            styles.itemContainer,
            styles.overview,
          )}
          >
            <EuiFlexGroup gutterSize="none" responsive={false}>
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
                          <EuiFlexItem grow={false}>
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
            </EuiFlexGroup>
          </div>
        </EuiFlexItem>
      )}
    </EuiFlexGroup>
  )
}

export default DatabaseOverview
