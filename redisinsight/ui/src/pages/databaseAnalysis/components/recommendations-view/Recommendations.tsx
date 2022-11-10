import React from 'react'
import { useSelector } from 'react-redux'
import cx from 'classnames'
import {
  EuiAccordion,
  EuiPanel,
  EuiTitle,
  EuiText,
  EuiTextColor,
  EuiFlexGroup,
  EuiFlexItem,
  EuiLoadingSpinner,
  EuiLink,
  EuiImage,
} from '@elastic/eui'
import { dbAnalysisSelector } from 'uiSrc/slices/analytics/dbAnalysis'
import recommendationsContent from 'uiSrc/constants/dbAnalisisRecomendations.json'
import { ReactComponent as CodeIcon } from 'uiSrc/assets/img/code-changes.svg'
import { ReactComponent as ConfigurationIcon } from 'uiSrc/assets/img/configuration-changes.svg'
import { ReactComponent as UpgradeIcon } from 'uiSrc/assets/img/upgrade.svg'
import logo from 'uiSrc/assets/img/welcome_bg_dark.jpg'

import styles from './styles.module.scss'

const badgesContent = [
  { id: 'code_changes', icon: <CodeIcon className={styles.badgeIcon} />, name: 'Code Changes' },
  { id: 'configuration_changes', icon: <ConfigurationIcon className={styles.badgeIcon} />, name: 'Configuration Changes' },
  { id: 'upgrade', icon: <UpgradeIcon className={styles.badgeIcon} />, name: 'Upgrade' },
]

const renderBadges = (badges) => (
  <EuiFlexGroup className={styles.badgesContainer} key={badges.id} responsive={false} justifyContent="spaceBetween">
    {badgesContent.map(({ id, icon, name }) => (badges.indexOf(id) === -1
      ? <EuiFlexItem key={id} className={styles.badge} grow={false} />
      : (
        <EuiFlexItem key={id} className={styles.badge} grow={false}>
          <div className={styles.badgeWrapper}>
            {icon}
            {name}
          </div>
        </EuiFlexItem>
      )))}
  </EuiFlexGroup>
)

const parseContent = ({ type, value }: { type: string, value: any }) => {
  switch (type) {
    case 'paragraph':
      return <EuiTextColor color="subdued">{value}</EuiTextColor>
    case 'span':
      return <EuiTextColor color="subdued" className={styles.span}>{value}</EuiTextColor>
    case 'link':
      return <EuiLink external={false} target="_blank" href={value.href}>{value.name}</EuiLink>
    case 'image':
      return <EuiImage size="l" alt="" src={logo} />
    default:
      return value
  }
}

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
