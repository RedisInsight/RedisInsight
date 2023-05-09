import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import cx from 'classnames'
import { EuiText, EuiButton, EuiPopover, EuiSpacer } from '@elastic/eui'

import { Pages } from 'uiSrc/constants'
import { recommendationsSelector, setIsContentVisible } from 'uiSrc/slices/recommendations/recommendations'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { ReactComponent as WelcomeIcon } from 'uiSrc/assets/img/icons/welcome.svg'
import { appContextDbConfig } from 'uiSrc/slices/app/context'
import { createNewAnalysis } from 'uiSrc/slices/analytics/dbAnalysis'
import { ConnectionType } from 'uiSrc/slices/interfaces'
import { ANALYZE_CLUSTER_TOOLTIP_MESSAGE, ANALYZE_TOOLTIP_MESSAGE } from 'uiSrc/constants/recommendations'
import PopoverRunAnalyze from '../popover-run-analyze'

import styles from './styles.module.scss'

const NoRecommendationsScreen = () => {
  const { id: instanceId, provider, connectionType } = useSelector(connectedInstanceSelector)
  const { data: { recommendations } } = useSelector(recommendationsSelector)
  const { treeViewDelimiter: delimiter = '' } = useSelector(appContextDbConfig)

  const [isShowInfo, setIsShowInfo] = useState(false)

  const dispatch = useDispatch()
  const history = useHistory()

  const handleClickDbAnalysisLink = () => {
    dispatch(setIsContentVisible(false))
    dispatch(createNewAnalysis(instanceId, delimiter))
    history.push(Pages.databaseAnalysis(instanceId))
    sendEventTelemetry({
      event: TelemetryEvent.INSIGHTS_RECOMMENDATION_DATABASE_ANALYSIS_CLICKED,
      eventData: {
        databaseId: instanceId,
        total: recommendations?.length,
        provider
      },
    })
    setIsShowInfo(false)
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
        Eager to see more recommendations? Run Database Analysis in order to see the magic happens.
      </EuiText>

      <PopoverRunAnalyze
        isShowPopover={isShowInfo}
        setIsShowPopover={setIsShowInfo}
        onApproveClick={handleClickDbAnalysisLink}
        popoverContent={
          connectionType === ConnectionType.Cluster
            ? ANALYZE_CLUSTER_TOOLTIP_MESSAGE
            : ANALYZE_TOOLTIP_MESSAGE
        }
      >
        <EuiButton
          fill
          color="secondary"
          size="s"
          onClick={() => setIsShowInfo(true)}
          data-testid="insights-db-analysis-link"
        >
          Analyze Database
        </EuiButton>
      </PopoverRunAnalyze>
    </div>
  )
}

export default NoRecommendationsScreen
