import React, { useCallback, useEffect, useRef, useState } from 'react'
import cx from 'classnames'
import { EuiButtonIcon, EuiTab, EuiTabs, keys } from '@elastic/eui'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useLocation, useParams } from 'react-router-dom'

import { changeSelectedTab, insightsPanelSelector, resetExplorePanelSearch, setExplorePanelIsPageOpen, toggleInsightsPanel } from 'uiSrc/slices/panels/insights'
import { InsightsPanelTabs } from 'uiSrc/slices/interfaces/insights'
import { recommendationsSelector } from 'uiSrc/slices/recommendations/recommendations'
import { sendEventTelemetry, TELEMETRY_EMPTY_VALUE, TelemetryEvent } from 'uiSrc/telemetry'
import { connectedInstanceCDSelector, connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { ONBOARDING_FEATURES } from 'uiSrc/components/onboarding-features'
import { FullScreen, OnboardingTour } from 'uiSrc/components'
import { appContextCapability } from 'uiSrc/slices/app/context'
import { getTutorialCapability } from 'uiSrc/utils'
import { isShowCapabilityTutorialPopover } from 'uiSrc/services'
import { EAManifestFirstKey } from 'uiSrc/constants'
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
  const { source: capabilitySource } = useSelector(appContextCapability)
  const { free = false } = useSelector(connectedInstanceCDSelector) ?? {}

  const [isFullScreen, setIsFullScreen] = useState<boolean>(false)

  const history = useHistory()
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

  useEffect(() => {
    if (!capabilitySource || !isShowCapabilityTutorialPopover(free)) {
      return
    }

    const tutorialCapabilityPath = getTutorialCapability(capabilitySource)?.path || ''

    // set 'path' with the path to capability tutorial
    if (tutorialCapabilityPath) {
      const search = new URLSearchParams(window.location.search)
      search.set('path', `${EAManifestFirstKey.TUTORIALS}/${tutorialCapabilityPath}`)
      history.push({ search: search.toString() })
    } else {
      // reset explore if tutorial is not found
      dispatch(resetExplorePanelSearch())
      dispatch(setExplorePanelIsPageOpen(false))
    }

    dispatch(changeSelectedTab(InsightsPanelTabs.Explore))
    dispatch(toggleInsightsPanel(true))
  }, [capabilitySource, free])

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
        databaseId: instanceId || TELEMETRY_EMPTY_VALUE,
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
        databaseId: instanceId || TELEMETRY_EMPTY_VALUE,
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
          databaseId: instanceId || TELEMETRY_EMPTY_VALUE,
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
          <span className={styles.tabName}>Explore</span>
        </OnboardingTour>
      </EuiTab>
      <EuiTab
        isSelected={tabSelected === InsightsPanelTabs.Recommendations}
        onClick={() => handleChangeTab(InsightsPanelTabs.Recommendations)}
        className={styles.tab}
        data-testid="recommendations-tab"
      >
        <>
          <span className={styles.tabName}>Tips</span>
          {(!!totalUnread && instanceId) && (
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
