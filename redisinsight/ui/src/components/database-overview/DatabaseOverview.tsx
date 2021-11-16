import React from 'react'
import cx from 'classnames'
import { EuiFlexGroup, EuiFlexItem, EuiIcon, EuiToolTip } from '@elastic/eui'

import styles from './styles.module.scss'

interface Props {
  maxLength: number;
  items: any[]
}

const DatabaseOverview = ({ maxLength, items }: Props) => (
  <EuiFlexGroup gutterSize="none" responsive={false}>
    {items.slice(0, maxLength).map((overviewItem) => (
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
)

export default DatabaseOverview
