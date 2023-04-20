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
import _content from 'uiSrc/constants/dbAnalysisRecommendations.json'
import { EAManifestFirstKey, Pages, Theme } from 'uiSrc/constants'
import { Vote } from 'uiSrc/constants/recommendations'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import RediStackDarkMin from 'uiSrc/assets/img/modules/redistack/RediStackDark-min.svg'
import RediStackLightMin from 'uiSrc/assets/img/modules/redistack/RediStackLight-min.svg'
import NoRecommendationsDark from 'uiSrc/assets/img/icons/recommendations_dark.svg'
import NoRecommendationsLight from 'uiSrc/assets/img/icons/recommendations_light.svg'
import { workbenchGuidesSelector } from 'uiSrc/slices/workbench/wb-guides'
import { workbenchTutorialsSelector } from 'uiSrc/slices/workbench/wb-tutorials'
import { resetWorkbenchEASearch, setWorkbenchEAMinimized } from 'uiSrc/slices/app/context'
import { IRecommendationsStatic } from 'uiSrc/slices/interfaces/recommendations'
import { EXTERNAL_LINKS } from 'uiSrc/constants/links'
import { RecommendationVoting } from 'uiSrc/components'
import { findMarkdownPathByPath } from 'uiSrc/utils'
import { renderBadges, renderBadgesLegend, renderContent, sortRecommendations } from './utils'

import styles from './styles.module.scss'

const recommendationsContent = _content as IRecommendationsStatic

const Recommendations = () => {
  const { data, loading } = useSelector(dbAnalysisSelector)
  const { items: guides } = useSelector(workbenchGuidesSelector)
  const { items: tutorials } = useSelector(workbenchTutorialsSelector)
  const { recommendations = [] } = data ?? {}

  const { theme } = useContext(ThemeContext)
  const { instanceId } = useParams<{ instanceId: string }>()
  const history = useHistory()
  const dispatch = useDispatch()

  const handleToggle = (isOpen: boolean, id: string) => sendEventTelemetry({
    event: isOpen
      ? TelemetryEvent.DATABASE_ANALYSIS_RECOMMENDATIONS_EXPANDED
      : TelemetryEvent.DATABASE_ANALYSIS_RECOMMENDATIONS_COLLAPSED,
    eventData: {
      databaseId: instanceId,
      recommendation: recommendationsContent[id]?.telemetryEvent || id,
    }
  })

  const goToTutorial = (mdPath: string, id: string) => {
    sendEventTelemetry({
      event: TelemetryEvent.DATABASE_RECOMMENDATIONS_TUTORIAL_CLICKED,
      eventData: {
        databaseId: instanceId,
        recommendation: recommendationsContent[id]?.telemetryEvent || id,
      }
    })

    dispatch(setWorkbenchEAMinimized(false))
    const quickGuidesPath = findMarkdownPathByPath(guides, mdPath)
    if (quickGuidesPath) {
      history.push(`${Pages.workbench(instanceId)}?path=${EAManifestFirstKey.GUIDES}/${quickGuidesPath}`)
      return
    }

    const tutorialsPath = findMarkdownPathByPath(tutorials, mdPath)
    if (tutorialsPath) {
      history.push(`${Pages.workbench(instanceId)}?path=${EAManifestFirstKey.TUTORIALS}/${tutorialsPath}`)
      return
    }

    dispatch(resetWorkbenchEASearch())
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
        {renderBadges(badges)}
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
      <div>
        {renderBadgesLegend()}
      </div>
      <div className={styles.recommendationsContainer}>
        {sortRecommendations(recommendations).map(({ name, params, vote }) => {
          const {
            id = '',
            title = '',
            content = '',
            badges = [],
            redisStack = false,
            tutorial,
          } = recommendationsContent[name]

          return (
            <div key={id} className={styles.recommendation} data-testid={`${id}-recommendation`}>
              <EuiAccordion
                id={name}
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
                  {renderContent(content, params)}
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
