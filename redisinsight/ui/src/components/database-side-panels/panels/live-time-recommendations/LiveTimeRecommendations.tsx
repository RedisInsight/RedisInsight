import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import {
  EuiLink,
  EuiTitle,
  EuiLoadingContent,
  EuiText,
  EuiIcon,
  EuiToolTip,
  EuiCheckbox,
  EuiTextColor,
  EuiBadge,
} from '@elastic/eui'
import { remove } from 'lodash'

import { Pages } from 'uiSrc/constants'
import { ANALYZE_CLUSTER_TOOLTIP_MESSAGE, ANALYZE_TOOLTIP_MESSAGE } from 'uiSrc/constants/recommendations'
import {
  recommendationsSelector,
  fetchRecommendationsAction,
  readRecommendationsAction,
  setIsContentVisible,
} from 'uiSrc/slices/recommendations/recommendations'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import { IRecommendation } from 'uiSrc/slices/interfaces/recommendations'
import { appContextDbConfig, setRecommendationsShowHidden } from 'uiSrc/slices/app/context'
import { ConnectionType } from 'uiSrc/slices/interfaces'
import { createNewAnalysis } from 'uiSrc/slices/analytics/dbAnalysis'

import InfoIcon from 'uiSrc/assets/img/icons/help_illus.svg'

import { EXTERNAL_LINKS } from 'uiSrc/constants/links'
import { ReactComponent as GithubSVG } from 'uiSrc/assets/img/github.svg'
import Recommendation from './components/recommendation'
import WelcomeScreen from './components/welcome-screen'
import PopoverRunAnalyze from './components/popover-run-analyze'
import styles from './styles.module.scss'

const LiveTimeRecommendations = () => {
  const { id: connectedInstanceId = '', provider, connectionType } = useSelector(connectedInstanceSelector)
  const {
    loading,
    data: { recommendations, totalUnread },
    content: recommendationsContent,
  } = useSelector(recommendationsSelector)
  const {
    showHiddenRecommendations: isShowHidden,
    treeViewDelimiter: delimiter = '',
  } = useSelector(appContextDbConfig)

  const [isShowApproveRun, setIsShowApproveRun] = useState<boolean>(false)

  // To prevent duplication emit for FlyOut close event
  // https://github.com/elastic/eui/issues/3437
  const isCloseEventSent = useRef<boolean>(false)
  // Flyout onClose did not updated between rerenders
  const recommendationsState = useRef<IRecommendation[]>([])

  const dispatch = useDispatch()
  const history = useHistory()

  const isShowHiddenDisplayed = recommendations.filter((r) => r.hide).length > 0

  useEffect(() => {
    dispatch(fetchRecommendationsAction(connectedInstanceId, onSuccessAction))
    isCloseEventSent.current = false

    return () => {
      sendEventTelemetry({
        event: TelemetryEvent.INSIGHTS_PANEL_CLOSED,
        eventData: getTelemetryData(recommendationsState.current),
      })
    }
  }, [])

  useEffect(() => {
    recommendationsState.current = recommendations
  }, [recommendations])

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

    sendEventTelemetry({
      event: TelemetryEvent.INSIGHTS_PANEL_CLOSED,
      eventData: getTelemetryData(recommendationsState.current),
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
        hide={hide}
        tutorial={recommendationsContent[name]?.tutorial}
        provider={provider}
        params={params}
        recommendationsContent={recommendationsContent}
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
                  New recommendations appear while you work with your database,
                  including how to improve performance and optimize memory usage.
                  <br />
                  Eager for more recommendations? Run Database Analysis to get started.
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
    <div
      className={styles.content}
    >
      <div className={styles.header}>
        {renderHeader()}
      </div>
      <div className={styles.body}>
        {(loading)
          ? (<EuiLoadingContent className={styles.loading} lines={4} />)
          : renderBody()}
      </div>
      <div className={styles.footer}>
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
      </div>
    </div>
  )
}

export default LiveTimeRecommendations
