import React, { useState } from 'react'
import { EuiButtonIcon, EuiFlexGroup, EuiFlexItem, EuiIcon, EuiPopover } from '@elastic/eui'
import cx from 'classnames'
import parse from 'html-react-parser'

import { RedisModuleDto } from 'apiSrc/modules/instances/dto/database-instance.dto'
import { getModule, truncateText } from 'uiSrc/utils'

import { IMetric } from '../OverviewMetrics/OverviewMetrics'

import styles from './styles.module.scss'

const ModulesInfoText = 'More information about Redis modules can be found <a class="link-underline" href="https://redis.io/modules" target="_blank" rel="noreferrer">here</a>.\nCreate a <a class="link-underline" href="https://redis.com/try-free/?utm_source=redis&utm_medium=app&utm_campaign=redisinsight" target="_blank" rel="noreferrer">free Redis database</a> with modules support on Redis Cloud.\n'

interface IProps {
  metrics: Array<IMetric>,
  modules: Array<RedisModuleDto>
}

const MoreInfoPopover = ({ metrics, modules }: IProps) => {
  const [isShowMoreInfoPopover, setIsShowMoreInfoPopover] = useState(false)
  return (
    <EuiPopover
      ownFocus={false}
      anchorPosition="downCenter"
      isOpen={isShowMoreInfoPopover}
      closePopover={() => setIsShowMoreInfoPopover(false)}
      anchorClassName={styles.moreInfo}
      panelClassName={cx('euiToolTip', 'popoverLikeTooltip', styles.mi_wrapper)}
      button={(
        <EuiButtonIcon
          iconType="boxesVertical"
          onClick={() => setIsShowMoreInfoPopover((isOpenPopover) => !isOpenPopover)}
          aria-labelledby="more info"
        />
      )}
    >
      <>
        <>
          { metrics.map((overviewItem) => (
            <EuiFlexGroup
              className={styles.moreInfoOverviewItem}
              key={overviewItem.id}
              data-test-subj={overviewItem.id}
              gutterSize="none"
              responsive={false}
              alignItems="center"
            >
              {overviewItem.tooltipIcon && (
                <EuiFlexItem className={styles.moreInfoOverviewIcon} grow={false}>
                  <EuiIcon
                    size="m"
                    type={overviewItem.tooltipIcon}
                    className={styles.icon}
                  />
                </EuiFlexItem>
              )}
              <EuiFlexItem className={styles.moreInfoOverviewContent} grow={false}>
                { overviewItem.tooltip.content }
              </EuiFlexItem>
              <EuiFlexItem className={styles.moreInfoOverviewTitle} grow={false}>
                { overviewItem.tooltip.title }
              </EuiFlexItem>
            </EuiFlexGroup>
          ))}
        </>
        <>
          <h4 className={styles.mi_fieldName}>Modules:</h4>
          <p className={styles.mi_smallText}>{parse(ModulesInfoText)}</p>
          {
              modules?.map(({ name = '', semanticVersion = '', version = '' }) => (
                <div key={name} className={cx(styles.mi_moduleName)}>
                  {`${truncateText(getModule(name)?.name ?? name, 50)} `}
                  {!!(semanticVersion || version) && (
                    <span className={styles.mi_version}>
                      v.
                      {' '}
                      {semanticVersion || version}
                    </span>
                  )}
                </div>
              ))
            }
        </>
      </>
    </EuiPopover>
  )
}

export default MoreInfoPopover
