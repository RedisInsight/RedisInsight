import React from 'react'
import { EuiToolTip, EuiFlexItem } from '@elastic/eui'
import styles from '../styles.module.scss'

interface Props {
  id: string
  icon: React.ReactElement
  name: string
}
const BadgeIcon = ({ id, icon, name }: Props) => (
  <EuiFlexItem key={id} className={styles.badge} grow={false}>
    <div data-testid={id} className={styles.badgeWrapper}>
      <EuiToolTip content={name} position="top" display="inlineBlock" anchorClassName="flex-row">
        {icon}
      </EuiToolTip>
    </div>
  </EuiFlexItem>
)

export default BadgeIcon
