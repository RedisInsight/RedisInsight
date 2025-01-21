import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import {
  EuiLink,
  EuiLoadingContent,
  EuiText,
  EuiIcon,
  EuiToolTip,
  EuiCheckbox,
  EuiTextColor,
} from '@elastic/eui'
import { remove } from 'lodash'

import { FeatureFlags, DEFAULT_DELIMITER, Pages } from 'uiSrc/constants'
import { ANALYZE_CLUSTER_TOOLTIP_MESSAGE, ANALYZE_TOOLTIP_MESSAGE } from 'uiSrc/constants/recommendations'
import {
  recommendationsSelector,
  fetchRecommendationsAction,
  readRecommendationsAction,
} from 'uiSrc/slices/recommendations/recommendations'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import { IRecommendation } from 'uiSrc/slices/interfaces/recommendations'
import { appContextDbConfig, setRecommendationsShowHidden } from 'uiSrc/slices/app/context'
import { ConnectionType } from 'uiSrc/slices/interfaces'
import { createNewAnalysis } from 'uiSrc/slices/analytics/dbAnalysis'
import { comboBoxToArray } from 'uiSrc/utils'

import InfoIcon from 'uiSrc/assets/img/icons/help_illus.svg'

import { EXTERNAL_LINKS } from 'uiSrc/constants/links'
import GithubSVG from 'uiSrc/assets/img/github.svg?react'
import { FeatureFlagComponent } from 'uiSrc/components'
import Recommendation from './components/recommendation'
import WelcomeScreen from './components/welcome-screen'
import PopoverRunAnalyze from './components/popover-run-analyze'
import styles from './styles.module.scss'

const LiveTimeRecommendations = () => {
  const { provider, connectionType } = useSelector(connectedInstanceSelector)
  const {
    loading,
    data: { recommendations },
    content: recommendationsContent,
  } = useSelector(recommendationsSelector)
  const {
    showHiddenRecommendations: isShowHidden,
    treeViewDelimiter = [DEFAULT_DELIMITER],
  } = useSelector(appContextDbConfig)

  const { instanceId } = useParams<{ instanceId: string }>()

  const [isShowApproveRun, setIsShowApproveRun] = useState<boolean>(false)

  const dispatch = useDispatch()
  const history = useHistory()

  const isShowHiddenDisplayed = recommendations.filter((r) => r.hide).length > 0

  useEffect(() => {
    if (!instanceId) return undefined

    dispatch(fetchRecommendationsAction(instanceId))

    return () => {
      dispatch(readRecommendationsAction(instanceId))
    }
  }, [])

  const handleClickDbAnalysisLink = () => {
    dispatch(createNewAnalysis(instanceId, comboBoxToArray(treeViewDelimiter)))
    history.push(Pages.databaseAnalysis(instanceId))
    sendEventTelemetry({
      event: TelemetryEvent.INSIGHTS_TIPS_DATABASE_ANALYSIS_CLICKED,
      eventData: {
        databaseId: instanceId,
        total: recommendations?.length,
        provider
      },
    })
    setIsShowApproveRun(false)
  }

  const onChangeShowHidden = (value: boolean) => {
    dispatch(setRecommendationsShowHidden(value))

    sendEventTelemetry({
      event: TelemetryEvent.INSIGHTS_TIPS_SHOW_HIDDEN,
      eventData: {
        action: !value ? 'hide' : 'show',
        ...getTelemetryData(recommendations)
      }
    })
  }

  const getTelemetryData = (recommendationsData: IRecommendation[]) => ({
    databaseId: instanceId,
    total: recommendationsData?.length,
    list: recommendationsData?.map(({ name }) => recommendationsContent[name]?.telemetryEvent ?? name),
    provider
  })

  const renderBody = () => {
    const recommendationsList = [...recommendations]
    if (!isShowHidden) {
      remove(recommendationsList, { hide: true })
    }

    if (!instanceId || !recommendationsList?.length) {
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
        tutorialId={recommendationsContent[name]?.tutorialId}
        provider={provider}
        params={params}
        recommendationsContent={recommendationsContent}
      />
    ))
  }

  const renderHeader = () => (
    <div className={styles.actions}>
      <div>
        <EuiTextColor className={styles.boldText}>Our Tips</EuiTextColor>
        <EuiToolTip
          position="bottom"
          anchorClassName={styles.tooltipAnchor}
          className={styles.tooltip}
          content={(
            <>
              Tips will help you improve your database.
              <br />
              New tips appear while you work with your database,
              including how to improve performance and optimize memory usage.
              <FeatureFlagComponent name={FeatureFlags.envDependent}>
                <>
                  <br />
                  Eager for more tips? Run Database Analysis to get started.
                </>
              </FeatureFlagComponent>
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
        <FeatureFlagComponent name={FeatureFlags.envDependent}>
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
        </FeatureFlagComponent>
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
  )

  return (
    <div className={styles.content}>
      <div className={styles.header}>
        {(instanceId && recommendations.length) ? renderHeader() : null}
      </div>
      <div className={styles.body}>
        {(loading)
          ? (<EuiLoadingContent className={styles.loading} lines={4} />)
          : renderBody()}
      </div>
      {instanceId && (
        <FeatureFlagComponent name={FeatureFlags.envDependent}>
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
              {' to get more tips'}
            </EuiText>
          </div>
        </FeatureFlagComponent>
      )}
    </div>
  )
}

export default LiveTimeRecommendations
