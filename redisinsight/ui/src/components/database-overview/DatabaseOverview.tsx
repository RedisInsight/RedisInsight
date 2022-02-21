import React, { useEffect, useState } from 'react'
import cx from 'classnames'
import { EuiFlexGroup, EuiFlexItem, EuiIcon, EuiToolTip } from '@elastic/eui'
import MoreInfoPopover from 'uiSrc/components/database-overview/components/MoreInfoPopover'
import { RedisModuleDto } from 'apiSrc/modules/instances/dto/database-instance.dto'
import { getResolutionLimits } from './utils/resolutionHelper'
import { IMetric } from './components/OverviewMetrics'
import DatabaseListModules from '../database-list-modules/DatabaseListModules'

import styles from './styles.module.scss'

interface Props {
  windowDimensions: number;
  metrics?: Array<IMetric>;
  modules?: Array<RedisModuleDto>;
}

interface IState<T> {
  visible: Array<T>,
  hidden: Array<T>
}

const DatabaseOverview = (props: Props) => {
  const { metrics: metricsProps = [], modules: modulesProps = [], windowDimensions } = props
  const [metrics, setMetrics] = useState<IState<IMetric>>({ visible: [], hidden: [] })
  const [modules, setModules] = useState<IState<RedisModuleDto>>({ visible: [], hidden: [] })

  useEffect(() => {
    const resolutionLimits = getResolutionLimits(
      windowDimensions,
      metricsProps.filter((item) => item.value !== undefined)
    )
    const metricsState: IState<IMetric> = {
      visible: [],
      hidden: []
    }
    metricsProps?.forEach((item) => {
      if (item.value !== undefined && item.groupId) {
        return
      }
      if (item.value === undefined || metricsState.visible.length >= resolutionLimits.metrics) {
        metricsState.hidden.push(item)
      } else {
        metricsState.visible.push(item)
      }
    })
    setMetrics(metricsState)
    setModules({
      visible: modulesProps.slice(0, resolutionLimits.modules),
      hidden: modulesProps.slice(resolutionLimits.modules)
    })
  }, [windowDimensions, metricsProps, modulesProps])

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
      {metrics.visible?.length > 0 && (
        <EuiFlexItem key="overview">
          <div className={cx('flex-row', styles.itemContainer, styles.overview, { [styles.noModules]: !modules.visible?.length })}>
            <EuiFlexGroup gutterSize="none" responsive={false}>
              {
                metrics.visible.map((overviewItem) => (
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
      <EuiFlexItem grow={false} style={{ flexShrink: 0 }}>
        <div
          className={cx('flex-row', styles.itemContainer, styles.modules, { [styles.noModules]: !modules.visible?.length })}
        >
          {!!modules.visible?.length && (
            <DatabaseListModules dark inCircle modules={modules.visible} />
          )}
          <MoreInfoPopover
            metrics={metrics.hidden}
            modules={modules.hidden}
          />
        </div>
      </EuiFlexItem>
    </EuiFlexGroup>
  )
}

export default DatabaseOverview
