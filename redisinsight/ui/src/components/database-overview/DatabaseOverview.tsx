import React, { useEffect, useState } from 'react'
import cx from 'classnames'
import { EuiFlexGroup, EuiFlexItem, EuiIcon, EuiToolTip } from '@elastic/eui'
import MoreInfoPopover from 'uiSrc/components/database-overview/components/MoreInfoPopover'
import { RedisModuleDto } from 'apiSrc/modules/instances/dto/database-instance.dto'
import { getResolutionLimits } from './utils/resolutionHelper'
import { IMetric } from './components/OverviewMetrics/OverviewMetrics'
import DatabaseListModules from '../database-list-modules/DatabaseListModules'

import styles from './styles.module.scss'

interface Props {
  metrics: Array<IMetric>;
  modules: Array<RedisModuleDto>;
  windowDimensions: number;
}

const DatabaseOverview = ({ metrics, modules, windowDimensions }: Props) => {
  const [lengthModules, setLengthModules] = useState(0)
  const [lengthOverviewItems, setLengthOverviewItems] = useState(5)

  useEffect(() => {
    const resolutionLimits = getResolutionLimits(windowDimensions, metrics)
    setLengthOverviewItems(resolutionLimits.metrics)
    setLengthModules(resolutionLimits.modules)
  }, [windowDimensions, metrics, modules])

  return (
    <EuiFlexGroup className={styles.container} gutterSize="none" responsive={false}>
      <EuiFlexItem key="overview">
        <div className={cx('flex-row', styles.itemContainer, styles.overview)}>
          <EuiFlexGroup gutterSize="none" responsive={false}>
            {metrics.slice(0, lengthOverviewItems).map((overviewItem) => (
              <EuiFlexItem
                className={cx(styles.overviewItem, overviewItem.className ?? '')}
                key={overviewItem.id}
                data-test-subj={overviewItem.id}
                grow={false}
              >
                <EuiToolTip
                  position="bottom"
                  className={styles.tooltip}
                  title={overviewItem.tooltip.title ?? ''}
                  content={overviewItem.tooltip.content}
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
                    <EuiFlexItem grow={false}>
                      { overviewItem.content }
                    </EuiFlexItem>
                  </EuiFlexGroup>
                </EuiToolTip>
              </EuiFlexItem>
            ))}
          </EuiFlexGroup>
        </div>
      </EuiFlexItem>
      <EuiFlexItem grow={false} style={{ flexShrink: 0 }}>
        <div className={cx('flex-row', styles.itemContainer, styles.modules, { [styles.noModules]: !modules?.length })}>
          {!!modules?.length && (
            <DatabaseListModules dark inCircle maxLength={lengthModules} modules={modules} />
          )}
          <MoreInfoPopover
            metrics={metrics?.slice(lengthOverviewItems)}
            modules={modules?.slice(lengthModules)}
          />
        </div>
      </EuiFlexItem>
    </EuiFlexGroup>
  )
}

export default DatabaseOverview
