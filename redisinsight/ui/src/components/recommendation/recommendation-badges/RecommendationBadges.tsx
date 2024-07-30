import React from 'react'
import { EuiFlexGroup } from '@elastic/eui'

import BadgeIcon from '../badge-icon'
import { badgesContent } from '../constants'
import styles from '../styles.module.scss'

export interface Props {
  badges?: string[]
}

const RecommendationBadges = ({ badges = [] }: Props) => (
  <EuiFlexGroup className={styles.badgesContainer} responsive={false} alignItems="center" justifyContent="spaceBetween">
    {badgesContent.map(({ id, name, icon }) => (
      badges.includes(id) && <BadgeIcon key={id} id={id} icon={icon} name={name} />
    ))}
  </EuiFlexGroup>
)

export default RecommendationBadges
