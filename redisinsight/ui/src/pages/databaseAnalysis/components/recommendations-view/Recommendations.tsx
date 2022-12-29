import React, { useContext } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { isNull, sortBy } from 'lodash'
import {
  EuiAccordion,
  EuiPanel,
  EuiText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
} from '@elastic/eui'
import { ThemeContext } from 'uiSrc/contexts/themeContext'
import { dbAnalysisSelector } from 'uiSrc/slices/analytics/dbAnalysis'
import recommendationsContent from 'uiSrc/constants/dbAnalysisRecommendations.json'
import { Theme } from 'uiSrc/constants'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import RediStackDarkMin from 'uiSrc/assets/img/modules/redistack/RediStackDark-min.svg'
import RediStackLightMin from 'uiSrc/assets/img/modules/redistack/RediStackLight-min.svg'

import { renderContent, renderBadges, renderBadgesLegend } from './utils'
import styles from './styles.module.scss'

const Recommendations = () => {
  const { data, loading } = useSelector(dbAnalysisSelector)
  const { recommendations = [] } = data ?? {}

  const { theme } = useContext(ThemeContext)
  const { instanceId } = useParams<{ instanceId: string }>()

  const handleToggle = (isOpen: boolean, id: string) => sendEventTelemetry({
    event: isOpen
      ? TelemetryEvent.DATABASE_ANALYSIS_RECOMMENDATIONS_EXPANDED
      : TelemetryEvent.DATABASE_ANALYSIS_RECOMMENDATIONS_COLLAPSED,
    eventData: {
      databaseId: instanceId,
      recommendation: id,
    }
  })

  const sortedRecommendations = sortBy(recommendations, ({ name }) =>
    (recommendationsContent[name]?.redisStack ? -1 : 0))

  const renderButtonContent = (redisStack: boolean, title: string, badges: string[]) => (
    <EuiFlexGroup className={styles.accordionButton} responsive={false} alignItems="center" justifyContent="spaceBetween">
      <EuiFlexGroup alignItems="center">
        <EuiFlexItem grow={false}>
          {redisStack && (
            <EuiIcon
              type={theme === Theme.Dark ? RediStackDarkMin : RediStackLightMin}
              className={styles.redisStack}
              data-testid="redis-stack-icon"
            />
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
        <EuiText size="m">No Recommendations at the moment.</EuiText>
      </div>
    )
  }

  return (
    <div className={styles.wrapper}>
      <div>
        {renderBadgesLegend()}
      </div>
      {sortedRecommendations.map(({ name }) => {
        const {
          id = '',
          title = '',
          content = '',
          badges = [],
          redisStack = false
        } = recommendationsContent[name]

        return (
          <div key={id} className={styles.recommendation}>
            <EuiAccordion
              id={name}
              arrowDisplay="right"
              buttonContent={renderButtonContent(redisStack, title, badges)}
              buttonClassName={styles.accordionBtn}
              buttonProps={{ 'data-test-subj': `${id}-button` }}
              className={styles.accordion}
              initialIsOpen
              onToggle={(isOpen) => handleToggle(isOpen, id)}
              data-testid={`${id}-accordion`}
            >
              <EuiPanel className={styles.accordionContent} color="subdued">
                {renderContent(content)}
              </EuiPanel>
            </EuiAccordion>
          </div>
        )
      })}
    </div>
  )
}

export default Recommendations
