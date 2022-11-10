import React from 'react'
import { useSelector } from 'react-redux'
import cx from 'classnames'
import {
  EuiAccordion,
  EuiPanel,
  EuiTitle,
  EuiText,
  EuiLoadingSpinner,
} from '@elastic/eui'
import { dbAnalysisSelector } from 'uiSrc/slices/analytics/dbAnalysis'
import recommendationsContent from 'uiSrc/constants/dbAnalysisRecommendations.json'

import { parseContent, renderBadges } from './utils'
import styles from './styles.module.scss'

const Recommendations = () => {
  const { data, loading } = useSelector(dbAnalysisSelector)
  const { recommendations = [] } = data ?? {}

  if (loading) {
    return (
      <div className={styles.container} data-testid="recommendations-loader">
        <EuiLoadingSpinner color="primary" className={styles.spinner} size="xl" />
        <EuiText className={styles.spinnerText}>Uploading recommendations...</EuiText>
      </div>
    )
  }

  if (!recommendations.length) {
    return (
      <div className={styles.container} data-testid="empty-recommendations-message">
        <EuiText className={styles.emptyMessage}>No Recommendations at the moment</EuiText>
      </div>
    )
  }

  return (
    <div className={styles.wrapper}>
      <EuiTitle className={cx('section-title', styles.title)}>
        <h4>{`RECOMMENDATIONS (${recommendations.length}):`}</h4>
      </EuiTitle>
      {recommendations.map(({ name }) => {
        const { id, title = '', content = '', badges } = recommendationsContent[name]
        return (
          <div key={id} className={styles.recommendation}>
            <EuiAccordion
              id={name}
              arrowDisplay="right"
              buttonContent={title}
              buttonClassName={styles.accordionBtn}
              className={styles.accordion}
            >
              <EuiPanel className={styles.accordionContent} color="subdued">
                {content.map((item: { type: string, value: any, id: string }) =>
                  (
                    <React.Fragment key={item.id}>
                      {parseContent(item)}
                    </React.Fragment>
                  ))}
              </EuiPanel>
            </EuiAccordion>
            <div>
              {renderBadges(badges)}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default Recommendations
