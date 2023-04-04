import React from 'react'
import { EuiText, EuiIcon } from '@elastic/eui'
import { ReactComponent as WelcomeIcon } from 'uiSrc/assets/img/icons/welcome.svg'
import { ReactComponent as AnalysisIcon } from 'uiSrc/assets/img/icons/analysis.svg'

import styles from './styles.module.scss'

const NoRecommendationsScreen = () => (
  <div className={styles.container} data-testid="no-recommendations-screen">
    <EuiText className={styles.bigText}>Welcome to recommendations</EuiText>
    <EuiText className={styles.mediumText}>Where we help you improve your database.</EuiText>
    <WelcomeIcon className={styles.icon} />
    <EuiText className={styles.text}>Eager to start? Go to</EuiText>
    <EuiText className={styles.page}>
      <EuiIcon
        type={AnalysisIcon}
        className={styles.smallIcon}
        data-testid="analysis-icon"
      />
      database analysis page
    </EuiText>
    <EuiText className={styles.text}>
      and click on -
      <b> new report</b>
    </EuiText>
    <EuiText className={styles.text}>in order to see the magic happens :)</EuiText>
  </div>
)

export default NoRecommendationsScreen
