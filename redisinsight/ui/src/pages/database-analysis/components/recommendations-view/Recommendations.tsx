import React, { useContext } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import { isNull } from 'lodash'
import { EuiAccordion, EuiIcon, EuiToolTip } from '@elastic/eui'

import { ThemeContext } from 'uiSrc/contexts/themeContext'
import {
  FeatureFlagComponent,
  RecommendationBadges,
  RecommendationBadgesLegend,
  RecommendationBody,
  RecommendationCopyComponent,
  RecommendationVoting,
} from 'uiSrc/components'
import { dbAnalysisSelector } from 'uiSrc/slices/analytics/dbAnalysis'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { FeatureFlags, Theme } from 'uiSrc/constants'
import { Vote } from 'uiSrc/constants/recommendations'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import RediStackDarkMin from 'uiSrc/assets/img/modules/redistack/RediStackDark-min.svg'
import RediStackLightMin from 'uiSrc/assets/img/modules/redistack/RediStackLight-min.svg'
import NoRecommendationsDark from 'uiSrc/assets/img/icons/recommendations_dark.svg'
import NoRecommendationsLight from 'uiSrc/assets/img/icons/recommendations_light.svg'
import { EXTERNAL_LINKS } from 'uiSrc/constants/links'
import { recommendationsSelector } from 'uiSrc/slices/recommendations/recommendations'
import { sortRecommendations } from 'uiSrc/utils/recommendation'
import { openTutorialByPath } from 'uiSrc/slices/panels/sidePanels'
import { findTutorialPath } from 'uiSrc/utils'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import { Text } from 'uiSrc/components/base/text'
import { Link } from 'uiSrc/components/base/link/Link'
import { Card } from 'uiSrc/components/base/layout'

import styles from './styles.module.scss'

const Recommendations = () => {
  const { data, loading } = useSelector(dbAnalysisSelector)
  const { provider } = useSelector(connectedInstanceSelector)
  const { content: recommendationsContent } = useSelector(
    recommendationsSelector,
  )
  const { recommendations = [] } = data ?? {}

  const { theme } = useContext(ThemeContext)
  const history = useHistory()
  const dispatch = useDispatch()
  const { instanceId } = useParams<{ instanceId: string }>()

  const handleToggle = (isOpen: boolean, id: string) =>
    sendEventTelemetry({
      event: isOpen
        ? TelemetryEvent.DATABASE_ANALYSIS_TIPS_EXPANDED
        : TelemetryEvent.DATABASE_ANALYSIS_TIPS_COLLAPSED,
      eventData: {
        databaseId: instanceId,
        recommendation: recommendationsContent[id]?.telemetryEvent || id,
        provider,
      },
    })

  const goToTutorial = (tutorialId: string, id: string) => {
    sendEventTelemetry({
      event: TelemetryEvent.DATABASE_TIPS_TUTORIAL_CLICKED,
      eventData: {
        databaseId: instanceId,
        recommendation: recommendationsContent[id]?.telemetryEvent || id,
        provider,
      },
    })

    const tutorialPath = findTutorialPath({ id: tutorialId || '' })
    dispatch(openTutorialByPath(tutorialPath || '', history))
  }

  const onRedisStackClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => event.stopPropagation()

  const renderButtonContent = (
    redisStack: boolean,
    title: string,
    badges: string[],
    id: string,
  ) => (
    <Row className={styles.accordionButton} align="center" justify="between">
      <Row align="center">
        <FlexItem onClick={onRedisStackClick}>
          {redisStack && (
            <Link
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
                  type={
                    theme === Theme.Dark ? RediStackDarkMin : RediStackLightMin
                  }
                  className={styles.redisStackIcon}
                  data-testid={`${id}-redis-stack-icon`}
                />
              </EuiToolTip>
            </Link>
          )}
        </FlexItem>
        <FlexItem>{title}</FlexItem>
      </Row>
      <FlexItem>
        <RecommendationBadges badges={badges} />
      </FlexItem>
    </Row>
  )

  if (loading) {
    return (
      <div
        className={styles.loadingWrapper}
        data-testid="recommendations-loader"
      />
    )
  }

  if (isNull(recommendations) || !recommendations.length) {
    return (
      <div
        className={styles.container}
        data-testid="empty-recommendations-message"
      >
        <EuiIcon
          type={
            theme === Theme.Dark
              ? NoRecommendationsDark
              : NoRecommendationsLight
          }
          className={styles.noRecommendationsIcon}
          data-testid="no=recommendations-icon"
        />
        <Text className={styles.bigText}>AMAZING JOB!</Text>
        <Text size="m">No Tips at the moment,</Text>
        <br />
        <Text size="m">keep up the good work!</Text>
      </div>
    )
  }

  return (
    <div className={styles.wrapper}>
      <RecommendationBadgesLegend />
      <div className={styles.recommendationsContainer}>
        {sortRecommendations(recommendations, recommendationsContent).map(
          ({ name, params, vote }) => {
            const {
              id = '',
              title = '',
              content = [],
              badges = [],
              redisStack = false,
              tutorialId,
              telemetryEvent,
            } = recommendationsContent[name] || {}

            if (!(name in recommendationsContent)) {
              return null
            }

            return (
              <div
                key={id}
                className={styles.recommendation}
                data-testid={`${id}-recommendation`}
              >
                <EuiAccordion
                  id={name}
                  key={`${name}-accordion`}
                  arrowDisplay="right"
                  buttonContent={renderButtonContent(
                    redisStack,
                    title,
                    badges,
                    id,
                  )}
                  buttonClassName={styles.accordionBtn}
                  buttonProps={{ 'data-test-subj': `${id}-button` }}
                  className={styles.accordion}
                  initialIsOpen
                  onToggle={(isOpen) => handleToggle(isOpen, id)}
                  data-testid={`${id}-accordion`}
                >
                  <Card className={styles.accordionContent}>
                    <RecommendationBody
                      elements={content}
                      params={params}
                      telemetryName={telemetryEvent ?? name}
                    />
                    {!!params?.keys?.length && (
                      <RecommendationCopyComponent
                        keyName={params.keys[0]}
                        provider={provider}
                        telemetryEvent={
                          recommendationsContent[name]?.telemetryEvent ?? name
                        }
                      />
                    )}
                  </Card>
                </EuiAccordion>
                <div className={styles.footer}>
                  <FeatureFlagComponent name={FeatureFlags.envDependent}>
                    <RecommendationVoting vote={vote as Vote} name={name} />
                  </FeatureFlagComponent>
                  {tutorialId && (
                    <PrimaryButton
                      size="s"
                      onClick={() => goToTutorial(tutorialId, id)}
                      data-testid={`${id}-to-tutorial-btn`}
                    >
                      Tutorial
                    </PrimaryButton>
                  )}
                </div>
              </div>
            )
          },
        )}
      </div>
    </div>
  )
}

export default Recommendations
