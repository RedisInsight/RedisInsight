import React, { useEffect, useRef } from 'react'
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
  EuiLoadingContent,
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
import { workbenchGuidesSelector } from 'uiSrc/slices/workbench/wb-guides'

import { workbenchTutorialsSelector } from 'uiSrc/slices/workbench/wb-tutorials'
import { IRecommendationsStatic } from 'uiSrc/slices/interfaces/recommendations'

import _content from 'uiSrc/constants/dbAnalysisRecommendations.json'
import { ReactComponent as AnalysisIcon } from 'uiSrc/assets/img/icons/analysis.svg'
import { ReactComponent as TriggerIcon } from 'uiSrc/assets/img/icons/live-time-recommendations.svg'

import Recommendation from './components/recommendation'
import WelcomeScreen from './components/welcome-screen'
import styles from './styles.module.scss'

const recommendationsContent = _content as IRecommendationsStatic

const LiveTimeRecommendations = () => {
  const { id: connectedInstanceId = '', } = useSelector(connectedInstanceSelector)
  const {
    loading,
    data: { recommendations, totalUnread },
    isContentVisible,
    isHighlighted
  } = useSelector(recommendationsSelector)
  const { items: guides } = useSelector(workbenchGuidesSelector)
  const { items: tutorials } = useSelector(workbenchTutorialsSelector)

  // To prevent duplication emit for FlyOut close event
  // https://github.com/elastic/eui/issues/3437
  const isCloseEventSent = useRef<boolean>(false)

  const dispatch = useDispatch()
  const history = useHistory()

  useEffect(() => {
    if (!connectedInstanceId) return

    // initial loading
    dispatch(fetchRecommendationsAction(connectedInstanceId))
  }, [connectedInstanceId])

  const toggleContent = () => {
    sendEventTelemetry({
      event: isContentVisible
        ? TelemetryEvent.INSIGHTS_RECOMMENDATIONS_CLOSED
        : TelemetryEvent.INSIGHTS_RECOMMENDATIONS_OPENED,
      eventData: getTelemetryData(),
    })

    if (!isContentVisible) {
      dispatch(fetchRecommendationsAction(
        connectedInstanceId,
        () => {
          if (totalUnread) {
            dispatch(readRecommendationsAction(connectedInstanceId))
          }
        }
      ))

      isCloseEventSent.current = false
    }
    dispatch(setIsContentVisible(!isContentVisible))
  }

  const handleClickDbAnalysisLink = () => {
    dispatch(setIsContentVisible(false))
    history.push(Pages.databaseAnalysis(connectedInstanceId))
  }

  const handleClose = () => {
    if (isCloseEventSent.current) {
      return
    }

    dispatch(setIsContentVisible(false))
    sendEventTelemetry({
      event: TelemetryEvent.INSIGHTS_RECOMMENDATIONS_CLOSED,
      eventData: getTelemetryData(),
    })
    isCloseEventSent.current = true
  }

  const getTelemetryData = () => ({
    databaseId: connectedInstanceId,
    total: recommendations?.length,
    list: recommendations?.map(({ name }) => recommendationsContent[name]?.liveTelemetryEvent ?? name),
  })

  const renderBody = () => {
    if (!recommendations?.length) {
      return <WelcomeScreen />
    }

    return recommendations?.map(({ id, name, read, vote }) => (
      <Recommendation
        id={id}
        key={name}
        name={name}
        isRead={read}
        vote={vote}
        instanceId={connectedInstanceId}
        guides={guides}
        tutorials={tutorials}
        tutorial={recommendationsContent[name]?.tutorial ?? ''}
      />
    ))
  }

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
        {isHighlighted && !isContentVisible
          ? <TriggerIcon className={cx(styles.triggerIconActive, styles.triggerIcon)} />
          : <TriggerIcon className={styles.triggerIcon} />}
      </div>
      {isContentVisible && (
        <EuiFlyout
          paddingSize="none"
          className={styles.content}
          ownFocus
          size="476px"
          onClose={handleClose}
          data-testid="insights-panel"
        >
          <EuiFlyoutHeader className={styles.header}>
            <EuiTitle className={styles.title}>
              <span>Insights Panel</span>
            </EuiTitle>
          </EuiFlyoutHeader>
          <EuiFlyoutBody className={styles.body}>
            {loading ? (<EuiLoadingContent className={styles.loading} lines={4} />) : renderBody()}
          </EuiFlyoutBody>
          <EuiFlyoutFooter className={styles.footer}>
            <EuiFlexGroup alignItems="center" gutterSize="none" justifyContent="center">
              <EuiFlexItem grow={false}>
                For latest report go to
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiButton
                  iconType={AnalysisIcon}
                  onClick={handleClickDbAnalysisLink}
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
