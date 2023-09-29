import React, { useEffect } from 'react'
import cx from 'classnames'
import { EuiText } from '@elastic/eui'
import { useDispatch, useSelector } from 'react-redux'
import { FeatureFlagComponent, OnboardingTour } from 'uiSrc/components'
import {
  fetchRecommendationsAction,
  recommendationsSelector,
  setIsContentVisible
} from 'uiSrc/slices/recommendations/recommendations'

import { ReactComponent as TriggerIcon } from 'uiSrc/assets/img/bulb.svg'
import { ReactComponent as TriggerActiveIcon } from 'uiSrc/assets/img/bulb-active.svg'
import { FeatureFlags } from 'uiSrc/constants'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { appContextWorkbenchEA, setWorkbenchEAOpened } from 'uiSrc/slices/app/context'
import LiveTimeRecommendations from './panels/live-time-recommendations'
import EnablementAreaWrapper from './panels/enablement-area'

import styles from './styles.module.scss'

const DELAY_TO_SHOW_ONBOARDING_MS = 500

const DatabaseSidePanels = () => {
  const {
    data: { totalUnread },
    isContentVisible: isRecommendationsOpen,
    isHighlighted,
  } = useSelector(recommendationsSelector)
  const { isOpened: isEAOpened } = useSelector(appContextWorkbenchEA)
  const { id: connectedInstanceId = '' } = useSelector(connectedInstanceSelector)

  const dispatch = useDispatch()

  useEffect(() => {
    if (!connectedInstanceId) return
    // initial loading
    dispatch(fetchRecommendationsAction(connectedInstanceId))
  }, [connectedInstanceId])

  useEffect(() => {
    if (isRecommendationsOpen) {
      dispatch(setWorkbenchEAOpened(false))
    }
  }, [isRecommendationsOpen])

  useEffect(() => {
    if (isEAOpened) {
      dispatch(setIsContentVisible(false))
    }
  }, [isEAOpened])

  const toggleRecommendationsPanel = () => {
    dispatch(setIsContentVisible(!isRecommendationsOpen))
  }

  const toggleExpolorePanel = () => {
    dispatch(setWorkbenchEAOpened(!isEAOpened))
  }

  const isPanelOpened = isEAOpened || isRecommendationsOpen

  const RecommendationTab = () => (
    <>
      <div
        className={cx(styles.trigger, { [styles.isOpen]: isPanelOpened })}
      >
        <OnboardingTour
          options={{ step: -1 }}
          anchorPosition="leftDown"
          panelClassName={styles.insightsOnboardPanel}
          delay={isRecommendationsOpen ? DELAY_TO_SHOW_ONBOARDING_MS : 0}
          rerenderWithDelay={isRecommendationsOpen}
        >
          <div
            className={styles.inner}
            role="button"
            tabIndex={0}
            onKeyDown={() => {}}
            onClick={toggleRecommendationsPanel}
            data-testid="recommendations-trigger"
          >
            {totalUnread > 0 && (
              <span className={styles.totalUnread} data-testid="recommendations-unread-count">{totalUnread}</span>
            )}
            {isHighlighted && !isRecommendationsOpen
              ? <TriggerActiveIcon className={styles.triggerIcon} />
              : <TriggerIcon className={styles.triggerIcon} />}
            <EuiText className={cx(
              styles.triggerText,
              { [styles.triggerHighlighted]: isHighlighted && !isRecommendationsOpen }
            )}
            >
              Insights
            </EuiText>
          </div>
        </OnboardingTour>
      </div>
    </>
  )

  const ExploreTab = () => (
    <>
      <div
        className={cx(styles.trigger, styles.exploreTrigger, { [styles.isOpen]: isPanelOpened })}
      >
        <div
          className={styles.inner}
          role="button"
          tabIndex={0}
          onKeyDown={() => {}}
          onClick={toggleExpolorePanel}
          data-testid="explore-trigger"
        >
          <TriggerIcon className={styles.triggerIcon} />
          <EuiText className={cx(
            styles.triggerText,
          )}
          >
            Explore
          </EuiText>
        </div>
      </div>
    </>
  )

  return (
    <div className={styles.wrapper}>
      <FeatureFlagComponent name={FeatureFlags.insightsRecommendations}>
        <>
          <RecommendationTab />
          {isRecommendationsOpen && (<LiveTimeRecommendations />)}
        </>
      </FeatureFlagComponent>
      <ExploreTab />
      {isEAOpened && (<EnablementAreaWrapper />)}
    </div>
  )
}

export default DatabaseSidePanels
