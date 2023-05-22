import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import {
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutFooter,
  EuiLink,
  EuiTitle,
  EuiLoadingContent,
  EuiText,
  EuiIcon,
  EuiToolTip,
  EuiFlyoutHeader,
  EuiCheckbox,
  EuiTextColor,
  EuiBadge,
} from '@elastic/eui'
import cx from 'classnames'
import { remove } from 'lodash'

import { Pages } from 'uiSrc/constants'
import { ANALYZE_CLUSTER_TOOLTIP_MESSAGE, ANALYZE_TOOLTIP_MESSAGE, ANIMATION_INSIGHT_PANEL_MS } from 'uiSrc/constants/recommendations'
import { OnboardingTour } from 'uiSrc/components'
import {
  recommendationsSelector,
  fetchRecommendationsAction,
  readRecommendationsAction,
  setIsContentVisible,
} from 'uiSrc/slices/recommendations/recommendations'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { workbenchGuidesSelector } from 'uiSrc/slices/workbench/wb-guides'

import { workbenchTutorialsSelector } from 'uiSrc/slices/workbench/wb-tutorials'
import { IRecommendation, IRecommendationsStatic } from 'uiSrc/slices/interfaces/recommendations'
import { appContextDbConfig, setRecommendationsShowHidden } from 'uiSrc/slices/app/context'
import { ConnectionType } from 'uiSrc/slices/interfaces'
import { createNewAnalysis } from 'uiSrc/slices/analytics/dbAnalysis'

import _content from 'uiSrc/constants/dbAnalysisRecommendations.json'
import { ReactComponent as TriggerIcon } from 'uiSrc/assets/img/bulb.svg'
import { ReactComponent as TriggerActiveIcon } from 'uiSrc/assets/img/bulb-active.svg'
import InfoIcon from 'uiSrc/assets/img/icons/help_illus.svg'

import { EXTERNAL_LINKS } from 'uiSrc/constants/links'
import { ReactComponent as GithubSVG } from 'uiSrc/assets/img/github.svg'
import Recommendation from './components/recommendation'
import WelcomeScreen from './components/welcome-screen'
import PopoverRunAnalyze from './components/popover-run-analyze'
import styles from './styles.module.scss'

const recommendationsContent = _content as IRecommendationsStatic

const DELAY_TO_SHOW_ONBOARDING_MS = 500

const LiveTimeRecommendations = () => {
  const { id: connectedInstanceId = '', provider, connectionType } = useSelector(connectedInstanceSelector)
  const {
    loading,
    data: { recommendations, totalUnread },
    isContentVisible,
    isHighlighted,
  } = useSelector(recommendationsSelector)
  const { items: guides } = useSelector(workbenchGuidesSelector)
  const { items: tutorials } = useSelector(workbenchTutorialsSelector)
  const {
    showHiddenRecommendations: isShowHidden,
    treeViewDelimiter: delimiter = '',
  } = useSelector(appContextDbConfig)

  const [isOpenInProgress, setIsOpenInProgress] = useState<boolean>(false)
  const [isShowApproveRun, setIsShowApproveRun] = useState<boolean>(false)

  // To prevent duplication emit for FlyOut close event
  // https://github.com/elastic/eui/issues/3437
  const isCloseEventSent = useRef<boolean>(false)

  const dispatch = useDispatch()
  const history = useHistory()

  const isShowHiddenDisplayed = recommendations.filter((r) => r.hide).length > 0

  useEffect(() => {
    if (!connectedInstanceId) return

    // initial loading
    dispatch(fetchRecommendationsAction(connectedInstanceId))
  }, [connectedInstanceId])

  useEffect(() => {
    // this panel can be opened outside
    if (isContentVisible) {
      if (ANIMATION_INSIGHT_PANEL_MS > 0) {
        setIsOpenInProgress(true)
        setTimeout(() => setIsOpenInProgress(false), ANIMATION_INSIGHT_PANEL_MS)
      }

      dispatch(fetchRecommendationsAction(connectedInstanceId, onSuccessAction))
      isCloseEventSent.current = false
    }

    if (!isContentVisible && !isCloseEventSent.current) {
      sendEventTelemetry({
        event: TelemetryEvent.INSIGHTS_PANEL_CLOSED,
        eventData: getTelemetryData(recommendations),
      })
    }
  }, [isContentVisible])

  const toggleContent = () => {
    dispatch(setIsContentVisible(!isContentVisible))
  }

  const onSuccessAction = (recommendationsData: IRecommendation[]) => {
    if (totalUnread) {
      dispatch(readRecommendationsAction(connectedInstanceId))
    }
    sendEventTelemetry({
      event: TelemetryEvent.INSIGHTS_PANEL_OPENED,
      eventData: getTelemetryData(recommendationsData),
    })
  }

  const handleClickDbAnalysisLink = () => {
    dispatch(setIsContentVisible(false))
    dispatch(createNewAnalysis(connectedInstanceId, delimiter))
    history.push(Pages.databaseAnalysis(connectedInstanceId))
    sendEventTelemetry({
      event: TelemetryEvent.INSIGHTS_RECOMMENDATION_DATABASE_ANALYSIS_CLICKED,
      eventData: {
        databaseId: connectedInstanceId,
        total: recommendations?.length,
        provider
      },
    })
    setIsShowApproveRun(false)
  }

  const handleClose = () => {
    if (isCloseEventSent.current) {
      return
    }

    dispatch(setIsContentVisible(false))
    sendEventTelemetry({
      event: TelemetryEvent.INSIGHTS_PANEL_CLOSED,
      eventData: getTelemetryData(recommendations),
    })
    isCloseEventSent.current = true
  }

  const onChangeShowHidden = (value: boolean) => {
    dispatch(setRecommendationsShowHidden(value))

    sendEventTelemetry({
      event: TelemetryEvent.INSIGHTS_RECOMMENDATION_SHOW_HIDDEN,
      eventData: {
        action: !value ? 'hide' : 'show',
        ...getTelemetryData(recommendations)
      }
    })
  }

  const getTelemetryData = (recommendationsData: IRecommendation[]) => ({
    databaseId: connectedInstanceId,
    total: recommendationsData?.length,
    list: recommendationsData?.map(({ name }) => recommendationsContent[name]?.telemetryEvent ?? name),
    provider
  })

  const renderBody = () => {
    const recommendationsList = [...recommendations]
    if (!isShowHidden) {
      remove(recommendationsList, { hide: true })
    }

    if (!recommendationsList?.length) {
      return <WelcomeScreen />
    }

    return recommendationsList?.map(({ id, name, read, vote, hide, params }) => (
      <Recommendation
        id={id}
        key={name}
        name={name}
        isRead={read}
        vote={vote}
        guides={guides}
        hide={hide}
        tutorials={tutorials}
        tutorial={recommendationsContent[name]?.tutorial}
        provider={provider}
        params={params}
      />
    ))
  }

  const renderHeader = () => (
    <>
      <div className={styles.headerTop}>
        <EuiTitle className={styles.title}>
          <span>Insights</span>
        </EuiTitle>
        <EuiToolTip
          position="bottom"
          content="This is the BETA version of recommendations that has limited availability. Let us know what you think about them in our GitHub repository."
        >
          <EuiBadge className={styles.betaBadge} title={undefined} data-testid="beta-label">BETA</EuiBadge>
        </EuiToolTip>
      </div>
      {!!recommendations.length && (
        <div className={styles.actions}>
          <div>
            <EuiTextColor className={styles.boldText}>Our Recommendations</EuiTextColor>
            <EuiToolTip
              position="bottom"
              anchorClassName={styles.tooltipAnchor}
              className={styles.tooltip}
              content={(
                <>
                  Recommendations will help you improve your database.
                  <br />
                  Work in the database to see new recommendations appeared on how to improve performance,
                  optimize memory usage, and enhance the performance of your database.
                  <br />
                  Eager to see more recommendations? Run Database Analysis in order to see the magic happens.
                </>
            )}
            >
              <EuiIcon
                className={styles.infoIcon}
                type="iInCircle"
                size="s"
                data-testid="recommendations-info-icon"
              />
            </EuiToolTip>
            <EuiLink
              external={false}
              href={EXTERNAL_LINKS.githubRepo}
              target="_blank"
              style={{ marginLeft: 6 }}
              data-testid="github-repo-btn"
            >
              <EuiIcon
                className={styles.githubIcon}
                aria-label="redis insight github repository"
                type={GithubSVG}
                size="s"
                data-testid="github-repo-icon"
              />
            </EuiLink>
          </div>

          {isShowHiddenDisplayed && (
            <EuiCheckbox
              id="showHidden"
              name="showHidden"
              label="Show hidden"
              checked={isShowHidden}
              className={styles.hideCheckbox}
              onChange={(e) => onChangeShowHidden(e.target.checked)}
              data-testid="checkbox-show-hidden"
              aria-label="checkbox show hidden"
            />
          )}
        </div>
      )}
    </>
  )

  return (
    <div className={styles.wrapper}>
      <div
        className={cx(styles.trigger, { [styles.isOpen]: isContentVisible })}
      >
        <OnboardingTour
          options={{ step: -1 }}
          anchorPosition="leftDown"
          panelClassName={styles.insightsOnboardPanel}
          delay={isContentVisible ? DELAY_TO_SHOW_ONBOARDING_MS : 0}
          rerenderWithDelay={isContentVisible}
        >
          <div
            className={styles.inner}
            role="button"
            tabIndex={0}
            onKeyDown={() => {}}
            onClick={toggleContent}
            data-testid="recommendations-trigger"
          >
            {totalUnread > 0 && (
              <span className={styles.totalUnread} data-testid="recommendations-unread-count">{totalUnread}</span>
            )}
            {isHighlighted && !isContentVisible
              ? <TriggerActiveIcon className={styles.triggerIcon} />
              : <TriggerIcon className={styles.triggerIcon} />}
            <EuiText className={cx(
              styles.triggerText,
              { [styles.triggerHighlighted]: isHighlighted && !isContentVisible }
            )}
            >
              Insights
            </EuiText>
          </div>
        </OnboardingTour>
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
            {renderHeader()}
          </EuiFlyoutHeader>
          <EuiFlyoutBody className={styles.body}>
            {(loading || isOpenInProgress)
              ? (<EuiLoadingContent className={styles.loading} lines={4} />)
              : renderBody()}
          </EuiFlyoutBody>
          <EuiFlyoutFooter className={styles.footer}>
            <EuiIcon className={styles.footerIcon} size="m" type={InfoIcon} />
            <EuiText className={styles.text}>
              {'Run '}
              <PopoverRunAnalyze
                isShowPopover={isShowApproveRun}
                setIsShowPopover={setIsShowApproveRun}
                onApproveClick={handleClickDbAnalysisLink}
                popoverContent={
                  connectionType === ConnectionType.Cluster
                    ? ANALYZE_CLUSTER_TOOLTIP_MESSAGE
                    : ANALYZE_TOOLTIP_MESSAGE
                }
              >
                <EuiLink
                  className={styles.link}
                  onClick={() => setIsShowApproveRun(true)}
                  data-testid="footer-db-analysis-link"
                >
                  Database Analysis
                </EuiLink>
              </PopoverRunAnalyze>
              {' to get more recommendations'}
            </EuiText>
          </EuiFlyoutFooter>
        </EuiFlyout>
      )}
    </div>
  )
}

export default LiveTimeRecommendations
