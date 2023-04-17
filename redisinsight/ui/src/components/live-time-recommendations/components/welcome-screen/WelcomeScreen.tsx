import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import cx from 'classnames'
import { EuiText, EuiButton } from '@elastic/eui'

import { Pages } from 'uiSrc/constants'
import { recommendationsSelector, setIsContentVisible } from 'uiSrc/slices/recommendations/recommendations'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { ReactComponent as WelcomeIcon } from 'uiSrc/assets/img/icons/welcome.svg'

import styles from './styles.module.scss'

const NoRecommendationsScreen = () => {
  const { id: instanceId } = useSelector(connectedInstanceSelector)
  const { data: { recommendations } } = useSelector(recommendationsSelector)

  const dispatch = useDispatch()
  const history = useHistory()

  const handleClickDbAnalysisLink = () => {
    dispatch(setIsContentVisible(false))
    history.push(Pages.databaseAnalysis(instanceId))
    sendEventTelemetry({
      event: TelemetryEvent.INSIGHTS_RECOMMENDATION_DATABASE_ANALYSIS_CLICKED,
      eventData: {
        databaseId: instanceId,
        total: recommendations?.length,
      },
    })
  }

  return (
    <div className={styles.container} data-testid="no-recommendations-screen">
      <EuiText className={styles.bigText}>Welcome to</EuiText>
      <EuiText className={styles.hugeText}>Insights!</EuiText>
      <EuiText className={styles.mediumText}>Where we will help you improve your database.</EuiText>
      <EuiText className={cx(styles.text, styles.bigMargin)}>
        Work in the database to see new recommendations appeared on how to improve performance, optimize memory usage,
        and enhance the performance of your database.
      </EuiText>
      <WelcomeIcon className={styles.icon} />
      <EuiText className={styles.text}>
        Eager to see more recommendations right now? Go to Database Analysis
        and click on the new report in order to see the magic happens.
      </EuiText>
      <EuiButton
        fill
        color="secondary"
        size="s"
        onClick={handleClickDbAnalysisLink}
        data-testid="insights-db-analysis-link"
      >
        Go to Database Analysis
      </EuiButton>
    </div>
  )
}

export default NoRecommendationsScreen
