import React, { useCallback, useEffect, useRef, useState } from 'react'
import cx from 'classnames'
import { EuiButtonIcon, EuiTab, EuiTabs, keys } from '@elastic/eui'
import { useDispatch, useSelector } from 'react-redux'

import { useLocation, useParams } from 'react-router-dom'
import { changeSelectedTab, insightsPanelSelector, toggleInsightsPanel } from 'uiSrc/slices/panels/insights'
import { InsightsPanelTabs } from 'uiSrc/slices/interfaces/insights'
import { recommendationsSelector } from 'uiSrc/slices/recommendations/recommendations'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { ONBOARDING_FEATURES } from 'uiSrc/components/onboarding-features'
import { FullScreen, OnboardingTour } from 'uiSrc/components'
import LiveTimeRecommendations from './panels/live-time-recommendations'
import EnablementAreaWrapper from './panels/enablement-area'

import styles from './styles.module.scss'

export interface Props {
  panelClassName?: string
}

const DatabaseSidePanels = (props: Props) => {
  const { panelClassName } = props
  const { isOpen, tabSelected } = useSelector(insightsPanelSelector)
  const { data: { totalUnread } } = useSelector(recommendationsSelector)
  const { provider } = useSelector(connectedInstanceSelector)

  const [isFullScreen, setIsFullScreen] = useState<boolean>(false)

  const { pathname } = useLocation()
  const dispatch = useDispatch()
  const { instanceId } = useParams<{ instanceId: string }>()
  const pathnameRef = useRef<string>(pathname)

  const page = pathname
    .replace(instanceId, '')
    .replace(/^\//g, '')

  useEffect(() => {
    window.addEventListener('keydown', handleEscFullScreen)
    return () => {
      window.removeEventListener('keydown', handleEscFullScreen)
    }
  }, [isFullScreen])

  useEffect(() => {
    if (isFullScreen && pathnameRef.current !== pathname) {
      setIsFullScreen(false)
    }

    pathnameRef.current = pathname
  }, [pathname, isFullScreen])

  const handleEscFullScreen = (event: KeyboardEvent) => {
    if (event.key === keys.ESCAPE && isFullScreen) {
      handleFullScreen()
    }
  }

  const handleClose = () => {
    dispatch(toggleInsightsPanel(false))

    sendEventTelemetry({
      event: TelemetryEvent.INSIGHTS_PANEL_CLOSED,
      eventData: {
        databaseId: instanceId,
        provider,
        page,
        tab: tabSelected
      },
    })
  }

  const handleChangeTab = (name: string) => {
    if (tabSelected === name) return

    dispatch(changeSelectedTab(name))

    sendEventTelemetry({
      event: TelemetryEvent.INSIGHTS_PANEL_TAB_CHANGED,
      eventData: {
        databaseId: instanceId,
        prevTab: tabSelected,
        currentTab: name,
      },
    })
  }

  const handleFullScreen = () => {
    setIsFullScreen((value) => {
      sendEventTelemetry({
        event: TelemetryEvent.INSIGHTS_PANEL_FULL_SCREEN_CLICKED,
        eventData: {
          databaseId: instanceId,
          state: value ? 'exit' : 'open'
        },
      })

      return !value
    })
  }

  const Tabs = useCallback(() => (
    <EuiTabs className={styles.tabs}>
      <EuiTab
        isSelected={tabSelected === InsightsPanelTabs.Explore}
        onClick={() => handleChangeTab(InsightsPanelTabs.Explore)}
        className={styles.tab}
        data-testid="explore-tab"
      >
        <OnboardingTour
          options={ONBOARDING_FEATURES.EXPLORE_REDIS}
          anchorPosition={isFullScreen ? 'rightUp' : 'leftUp'}
          anchorWrapperClassName={styles.onboardingAnchorWrapper}
          fullSize
        >
          <span className={styles.tabName}>Explore Redis</span>
        </OnboardingTour>
      </EuiTab>
      <EuiTab
        isSelected={tabSelected === InsightsPanelTabs.Recommendations}
        onClick={() => handleChangeTab(InsightsPanelTabs.Recommendations)}
        className={styles.tab}
        data-testid="recommendations-tab"
      >
        <>
          <span className={styles.tabName}>Redis Tips</span>
          {!!totalUnread && (
            <div
              className={styles.tabTotalUnread}
              data-testid="recommendations-unread-count"
            >
              {totalUnread}
            </div>
          )}
        </>
      </EuiTab>
    </EuiTabs>
  ), [tabSelected, totalUnread, isFullScreen])

  return (
    <>
      {isOpen && (
        <div
          className={cx(styles.panel, panelClassName, { [styles.fullScreen]: isFullScreen })}
          data-testid="insights-panel"
        >
          <div className={styles.panelInner}>
            <div className={styles.header}>
              <Tabs />
              <FullScreen isFullScreen={isFullScreen} onToggleFullScreen={handleFullScreen} btnTestId="fullScreen-insights-btn" />
              <EuiButtonIcon
                iconSize="m"
                iconType="cross"
                color="primary"
                aria-label="close insights"
                className={styles.closeBtn}
                onClick={handleClose}
                data-testid="close-insights-btn"
              />
            </div>
            <div className={styles.body}>
              {tabSelected === InsightsPanelTabs.Explore && (<EnablementAreaWrapper />)}
              {tabSelected === InsightsPanelTabs.Recommendations && (<LiveTimeRecommendations />)}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default DatabaseSidePanels
