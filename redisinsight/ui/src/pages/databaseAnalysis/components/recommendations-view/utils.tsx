import React from 'react'
import { isString, isArray, sortBy } from 'lodash'
import {
  EuiTextColor,
  EuiToolTip,
  EuiFlexGroup,
  EuiFlexItem,
  EuiLink,
  EuiSpacer,
} from '@elastic/eui'
import { SpacerSize } from '@elastic/eui/src/components/spacer/spacer'
import cx from 'classnames'
import _content from 'uiSrc/constants/dbAnalysisRecommendations.json'
import { IRecommendationsStatic } from 'uiSrc/slices/interfaces/recommendations'
import { ReactComponent as CodeIcon } from 'uiSrc/assets/img/code-changes.svg'
import { ReactComponent as ConfigurationIcon } from 'uiSrc/assets/img/configuration-changes.svg'
import { ReactComponent as UpgradeIcon } from 'uiSrc/assets/img/upgrade.svg'
import { Recommendation } from 'apiSrc/modules/database-analysis/models/recommendation'

import styles from './styles.module.scss'

export interface IContentElement {
  id: string
  type: string
  value: any[] | any
  parameter?: string[]
}

const recommendationsContent = _content as IRecommendationsStatic

const badgesContent = [
  { id: 'code_changes', icon: <CodeIcon className={styles.badgeIcon} />, name: 'Code Changes' },
  { id: 'configuration_changes', icon: <ConfigurationIcon className={styles.badgeIcon} />, name: 'Configuration Changes' },
  { id: 'upgrade', icon: <UpgradeIcon className={styles.badgeIcon} />, name: 'Upgrade' },
]

export const renderBadges = (badges: string[]) => (
  <EuiFlexGroup className={styles.badgesContainer} responsive={false} alignItems="center" justifyContent="spaceBetween">
    {badgesContent.map(({ id, name, icon }) => (badges.indexOf(id) > -1 && (
      <EuiFlexItem key={id} className={styles.badge} grow={false}>
        <div data-testid={id} className={styles.badgeWrapper}>
          <EuiToolTip
            content={name}
            position="top"
            display="inlineBlock"
            anchorClassName="flex-row"
          >
            {icon}
          </EuiToolTip>
        </div>
      </EuiFlexItem>
    )))}
  </EuiFlexGroup>
)

export const renderBadgesLegend = () => (
  <EuiFlexGroup data-testid="badges-legend" className={styles.badgesLegend} responsive={false} justifyContent="flexEnd">
    {badgesContent.map(({ id, icon, name }) => (
      <EuiFlexItem key={id} className={styles.badge} grow={false}>
        <div className={styles.badgeWrapper}>
          {icon}
          {name}
        </div>
      </EuiFlexItem>
    ))}
  </EuiFlexGroup>
)

export const replaceVariables = (value: any[] | any, parameter?: string[], params?: any) => (
  parameter && isString(value) ? value.replace(/\$\{\d}/g, (matched) => {
    const parameterIndex: string = matched.substring(
      matched.indexOf('{') + 1,
      matched.lastIndexOf('}')
    )
    return params[parameter[+parameterIndex]]
  }) : value
)

const renderContentElement = ({ id, type, value: jsonValue, parameter }: IContentElement, params: any) => {
  const value = replaceVariables(jsonValue, parameter, params)
  switch (type) {
    case 'paragraph':
      return (
        <EuiTextColor data-testid={`paragraph-${id}`} key={id} component="div" className={styles.text} color="subdued">
          {value}
        </EuiTextColor>
      )
    case 'pre':
      return (
        <EuiTextColor data-testid={`pre-${id}`} key={id} color="subdued">
          <pre className={cx(styles.span, styles.text)}>
            {value}
          </pre>
        </EuiTextColor>
      )
    case 'span':
      return <EuiTextColor data-testid={`span-${id}`} key={id} color="subdued" className={cx(styles.span, styles.text)}>{value}</EuiTextColor>
    case 'link':
      return <EuiLink key={id} external={false} data-testid="read-more-link" target="_blank" href={value.href}>{value.name}</EuiLink>
    case 'spacer':
      return <EuiSpacer data-testid={`spacer-${id}`} key={id} size={value as SpacerSize} />
    case 'list':
      return (
        <ul data-testid={`list-${id}`} key={id}>
          {isArray(jsonValue) && jsonValue.map((listElement: IContentElement[]) => (
            <li>{renderContent(listElement, params)}</li>
          ))}
        </ul>
      )
    default:
      return value
  }
}

export const renderContent = (elements: IContentElement[], params: any) => (
  elements?.map((item) => renderContentElement(item, params)))

export const sortRecommendations = (recommendations: any[]) => sortBy(recommendations, [
  ({ name }) => name !== 'searchJSON',
  ({ name }) => name !== 'searchIndexes',
  ({ name }) => recommendationsContent[name]?.redisStack,
  ({ name }) => name,
])
