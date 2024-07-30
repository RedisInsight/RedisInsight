import React from 'react'
import { EuiFlexGroup, EuiFlexItem } from '@elastic/eui'

import { badgesContent } from '../constants'
import styles from '../styles.module.scss'

const RecommendationBadgesLegend = () => (
  <EuiFlexGroup data-testid="badges-legend" className={styles.badgesLegend} responsive={false} justifyContent="flexEnd">
    {badgesContent.map(({ id, icon, name }) => (
      <EuiFlexItem key={id} className={styles.badge} grow={false}>
        <div className={styles.badgeWrapper}>
          {icon}
          {name}
        </div>
      </EuiFlexItem>
    ))}
  </EuiFlexGroup>
)

export default RecommendationBadgesLegend
