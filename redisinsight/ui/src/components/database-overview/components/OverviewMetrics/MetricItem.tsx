import cx from 'classnames'
import { EuiFlexGroup, EuiFlexItem, EuiIcon, EuiToolTip } from '@elastic/eui'
import React, { CSSProperties, ReactNode } from 'react'
import styles from 'uiSrc/components/database-overview/styles.module.scss'
import { IMetric } from 'uiSrc/components/database-overview/components/OverviewMetrics/OverviewMetrics'

export interface OverviewItemProps {
  children: ReactNode
  className?: string
  id?: string
  style?: CSSProperties
}
export const OverviewItem = ({
  children,
  className,
  id,
  style,
}: OverviewItemProps) => (
  <EuiFlexItem
    className={cx(styles.overviewItem, className)}
    key={id}
    data-test-subj={id}
    data-testid={id}
    grow={false}
    style={style}
  >
    {children}
  </EuiFlexItem>
)

const MetricItem = (
  props: Partial<IMetric> & {
    tooltipContent?: ReactNode
    style?: CSSProperties
  },
) => {
  const { className = '', content, icon, id, tooltipContent, style } = props
  return (
    <OverviewItem id={id} className={className} style={style}>
      <EuiToolTip
        position="bottom"
        className={styles.tooltip}
        content={tooltipContent}
      >
        <EuiFlexGroup
          gutterSize="none"
          responsive={false}
          alignItems="center"
          justifyContent="center"
        >
          {icon && (
            <EuiFlexItem grow={false} className={styles.icon}>
              <EuiIcon size="m" type={icon} className={styles.icon} />
            </EuiFlexItem>
          )}
          <EuiFlexItem grow={false} className={styles.overviewItemContent}>
            {content}
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiToolTip>
    </OverviewItem>
  )
}

export default MetricItem
