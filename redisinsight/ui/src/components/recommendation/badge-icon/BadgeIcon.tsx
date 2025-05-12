import React from 'react'
import { EuiToolTip } from '@elastic/eui'
import { FlexItem } from 'uiSrc/components/base/layout/flex'
import styles from '../styles.module.scss'

export interface Props {
  id: string
  icon: React.ReactElement
  name: string
}
const BadgeIcon = ({ id, icon, name }: Props) => (
  <FlexItem
    key={id}
    className={styles.badge}
    data-testid={`recommendation-badge-${id}`}
  >
    <div data-testid={id} className={styles.badgeWrapper}>
      <EuiToolTip
        content={name}
        position="top"
        display="inlineBlock"
        anchorClassName="flex-row"
      >
        {icon}
      </EuiToolTip>
    </div>
  </FlexItem>
)

export default BadgeIcon
