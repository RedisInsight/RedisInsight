import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import {
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiFlyoutFooter,
  EuiFlexGroup,
  EuiFlexItem,
  EuiButton,
  EuiTitle,
} from '@elastic/eui'
import cx from 'classnames'

import { Pages } from 'uiSrc/constants'
import {
  recommendationsSelector,
  fetchRecommendationsAction,
  readRecommendationsAction,
  setIsContentVisible
} from 'uiSrc/slices/recommendations/recommendations'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { ReactComponent as AnalysisIcon } from 'uiSrc/assets/img/icons/analysis.svg'
import { ReactComponent as DefaultIcon } from 'uiSrc/assets/img/icons/live-time-recommendations.svg'
import { ReactComponent as HighlightedIcon } from 'uiSrc/assets/img/icons/live-time-recommendations-active.svg'

import Recommendation from './components/recommendation'
import WelcomeScreen from './components/welcome-screen'
import styles from './styles.module.scss'

const TIMEOUT_TO_GET_RECOMMENDATION = 10_000

const LiveTimeRecommendations = () => {
  let interval: NodeJS.Timeout
  const { id: connectedInstanceId = '', } = useSelector(connectedInstanceSelector)
  const {
    data: { recommendations, totalUnread },
    isContentVisible,
    isHighlighted
  } = useSelector(recommendationsSelector)

  const dispatch = useDispatch()
  const history = useHistory()

  const toggleContent = () => {
    sendEventTelemetry({
      event: isContentVisible
        ? TelemetryEvent.INSIGHTS_RECOMMENDATIONS_CLOSED
        : TelemetryEvent.INSIGHTS_RECOMMENDATIONS_OPENED,
      eventData: {
        databaseId: connectedInstanceId,
        total: recommendations?.length,
        list: recommendations.map(({ name }) => name),
      }
    })

    if (!isContentVisible && totalUnread) {
      dispatch(readRecommendationsAction(connectedInstanceId))
    }
    dispatch(setIsContentVisible(!isContentVisible))
  }

  const handleClick = () => {
    dispatch(setIsContentVisible(false))
    history.push(Pages.databaseAnalysis(connectedInstanceId))
  }

  const handleClose = () => {
    dispatch(setIsContentVisible(false))
  }

  const renderBody = () => {
    if (!recommendations.length) {
      return <WelcomeScreen />
    }

    return recommendations?.map(({ name }) => (
      <Recommendation
        key={name}
        name={name}
        instanceId={connectedInstanceId}
      />
    ))
  }

  useEffect(() => {
    interval = setInterval(() => {
      if (document.hidden) return

      dispatch(fetchRecommendationsAction(
        connectedInstanceId,
        () => {},
        () => clearInterval(interval),
      ))
    }, TIMEOUT_TO_GET_RECOMMENDATION)
    return () => clearInterval(interval)
  }, [connectedInstanceId])

  return (
    <div className={styles.wrapper}>
      <div
        role="button"
        tabIndex={0}
        onKeyDown={() => {}}
        onClick={toggleContent}
        className={cx(styles.trigger, { [styles.isOpen]: isContentVisible })}
        data-testid="recommendations-trigger"
      >
        {isHighlighted ? <HighlightedIcon /> : <DefaultIcon className={styles.triggerIcon} />}
      </div>
      {isContentVisible && (
        <EuiFlyout
          paddingSize="none"
          className={styles.content}
          ownFocus
          size="476px"
          onClose={handleClose}
        >
          <EuiFlyoutHeader className={styles.header}>
            <EuiTitle className={styles.title}>
              <span>Insights Panel</span>
            </EuiTitle>
          </EuiFlyoutHeader>
          <EuiFlyoutBody className={styles.body}>
            {renderBody()}
          </EuiFlyoutBody>
          <EuiFlyoutFooter className={styles.footer}>
            <EuiFlexGroup alignItems="center" gutterSize="none" justifyContent="center">
              <EuiFlexItem grow={false}>
                For latest report go to
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiButton
                  iconType={AnalysisIcon}
                  onClick={handleClick}
                  className={styles.footerBtn}
                  data-testid="database-analysis-link"
                >
                  database analysis page
                </EuiButton>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlyoutFooter>
        </EuiFlyout>
      )}
    </div>
  )
}

export default LiveTimeRecommendations
