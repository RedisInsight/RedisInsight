import React from 'react'
import { EuiButtonIcon, EuiFlexGroup, EuiFlexItem } from '@elastic/eui'

import styles from './styles.module.scss'

export interface Props {
  width: number
  selectionCount: number
  actions: (JSX.Element | null)[]
  onCloseActionBar: () => void
}

const ActionBar = ({
  width,
  selectionCount,
  actions,
  onCloseActionBar,
}: Props) => (
  <div className={styles.inner}>
    <EuiFlexGroup
      justifyContent="center"
      alignItems="center"
      className={styles.container}
      gutterSize="m"
      responsive={false}
      style={{
        left: `calc(${width / 2}px - 156px)`,
      }}
    >
      <EuiFlexItem grow={false} className={styles.text}>
        {`You selected: ${selectionCount} items`}
      </EuiFlexItem>
      {actions?.map((action, index) => (
        <EuiFlexItem grow={false} className={styles.actions} key={index}>
          {action}
        </EuiFlexItem>
      ))}
      <EuiFlexItem grow={false} className={styles.cross}>
        <EuiButtonIcon
          iconType="cross"
          color="primary"
          aria-label="Cancel selecting"
          onClick={() => onCloseActionBar()}
          data-testid="cancel-selecting"
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  </div>
)

export default ActionBar
