import React, { useContext } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useHistory } from 'react-router-dom'
import { isNull } from 'lodash'
import {
  EuiAccordion,
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiLink,
  EuiPanel,
  EuiText,
  EuiToolTip,
} from '@elastic/eui'
import { ThemeContext } from 'uiSrc/contexts/themeContext'
import { dbAnalysisSelector } from 'uiSrc/slices/analytics/dbAnalysis'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { Pages, Theme } from 'uiSrc/constants'
import { Vote } from 'uiSrc/constants/recommendations'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import RediStackDarkMin from 'uiSrc/assets/img/modules/redistack/RediStackDark-min.svg'
import RediStackLightMin from 'uiSrc/assets/img/modules/redistack/RediStackLight-min.svg'
import NoRecommendationsDark from 'uiSrc/assets/img/icons/recommendations_dark.svg'
import NoRecommendationsLight from 'uiSrc/assets/img/icons/recommendations_light.svg'

import { EXTERNAL_LINKS } from 'uiSrc/constants/links'
import { RecommendationVoting, RecommendationCopyComponent } from 'uiSrc/components'
import { recommendationsSelector } from 'uiSrc/slices/recommendations/recommendations'
import { openNewWindowDatabase } from 'uiSrc/utils'

import {
  sortRecommendations,
  renderRecommendationBadgesLegend,
  renderRecommendationBadges,
  renderRecommendationContent,
} from 'uiSrc/utils/recommendation/utils'

import styles from './styles.module.scss'

const Recommendations = () => {
  const { data, loading } = useSelector(dbAnalysisSelector)
  const { provider } = useSelector(connectedInstanceSelector)
  const { content: recommendationsContent } = useSelector(recommendationsSelector)
  const { recommendations = [] } = data ?? {}

  const { theme } = useContext(ThemeContext)
  const history = useHistory()
  const dispatch = useDispatch()
  const { instanceId } = useParams<{ instanceId: string }>()

  const handleToggle = (isOpen: boolean, id: string) => sendEventTelemetry({
    event: isOpen
      ? TelemetryEvent.DATABASE_ANALYSIS_RECOMMENDATIONS_EXPANDED
      : TelemetryEvent.DATABASE_ANALYSIS_RECOMMENDATIONS_COLLAPSED,
    eventData: {
      databaseId: instanceId,
      recommendation: recommendationsContent[id]?.telemetryEvent || id,
      provider,
    }
  })

  const goToTutorial = (mdPath: string, id: string) => {
    sendEventTelemetry({
      event: TelemetryEvent.DATABASE_RECOMMENDATIONS_TUTORIAL_CLICKED,
      eventData: {
        databaseId: instanceId,
        recommendation: recommendationsContent[id]?.telemetryEvent || id,
        provider,
      }
    })

    // dispatch(setWorkbenchEAOpened(false))
    if (mdPath) {
      openNewWindowDatabase(`${Pages.workbench(instanceId)}?guidePath=${mdPath}`)
      return
    }

    // dispatch(resetExplorePanelSearchContext())
    history.push(Pages.workbench(instanceId))
  }

  const onRedisStackClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => event.stopPropagation()

  const renderButtonContent = (redisStack: boolean, title: string, badges: string[], id: string) => (
    <EuiFlexGroup className={styles.accordionButton} responsive={false} alignItems="center" justifyContent="spaceBetween">
      <EuiFlexGroup alignItems="center">
        <EuiFlexItem onClick={onRedisStackClick} grow={false}>
          {redisStack && (
            <EuiLink
              external={false}
              target="_blank"
              href={EXTERNAL_LINKS.redisStack}
              className={styles.redisStackLink}
              data-testid={`${id}-redis-stack-link`}
            >
              <EuiToolTip
                content="Redis Stack"
                position="top"
                display="inlineBlock"
                anchorClassName="flex-row"
              >
                <EuiIcon
                  type={theme === Theme.Dark ? RediStackDarkMin : RediStackLightMin}
                  className={styles.redisStackIcon}
                  data-testid={`${id}-redis-stack-icon`}
                />
              </EuiToolTip>
            </EuiLink>
          )}
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          {title}
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiFlexItem grow={false}>
        {renderRecommendationBadges(badges)}
      </EuiFlexItem>
    </EuiFlexGroup>
  )

  if (loading) {
    return (
      <div className={styles.loadingWrapper} data-testid="recommendations-loader" />
    )
  }

  if (isNull(recommendations) || !recommendations.length) {
    return (
      <div className={styles.container} data-testid="empty-recommendations-message">
        <EuiIcon
          type={theme === Theme.Dark ? NoRecommendationsDark : NoRecommendationsLight}
          className={styles.noRecommendationsIcon}
          data-testid="no=recommendations-icon"
        />
        <EuiText className={styles.bigText}>AMAZING JOB!</EuiText>
        <EuiText size="m">No Recommendations at the moment,</EuiText>
        <br />
        <EuiText size="m">keep up the good work!</EuiText>
      </div>
    )
  }

  return (
    <div className={styles.wrapper}>
      {renderRecommendationBadgesLegend()}
      <div className={styles.recommendationsContainer}>
        {sortRecommendations(recommendations, recommendationsContent).map(({ name, params, vote }) => {
          const {
            id = '',
            title = '',
            content = [],
            badges = [],
            redisStack = false,
            tutorial,
            telemetryEvent
          } = recommendationsContent[name] || {}

          if (!(name in recommendationsContent)) {
            return null
          }

          return (
            <div key={id} className={styles.recommendation} data-testid={`${id}-recommendation`}>
              <EuiAccordion
                id={name}
                key={`${name}-accordion`}
                arrowDisplay="right"
                buttonContent={renderButtonContent(redisStack, title, badges, id)}
                buttonClassName={styles.accordionBtn}
                buttonProps={{ 'data-test-subj': `${id}-button` }}
                className={styles.accordion}
                initialIsOpen
                onToggle={(isOpen) => handleToggle(isOpen, id)}
                data-testid={`${id}-accordion`}
              >
                <EuiPanel className={styles.accordionContent} color="subdued">
                  {renderRecommendationContent(content, params, { telemetryName: telemetryEvent ?? name })}
                  {!!params?.keys?.length && (
                    <RecommendationCopyComponent
                      keyName={params.keys[0]}
                      provider={provider}
                      telemetryEvent={recommendationsContent[name]?.telemetryEvent ?? name}
                    />
                  )}
                </EuiPanel>
              </EuiAccordion>
              <div className={styles.footer}>
                <RecommendationVoting vote={vote as Vote} name={name} />
                {tutorial && (
                  <EuiButton
                    fill
                    color="secondary"
                    size="s"
                    onClick={() => goToTutorial(tutorial, id)}
                    data-testid={`${id}-to-tutorial-btn`}
                  >
                    Tutorial
                  </EuiButton>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Recommendations
