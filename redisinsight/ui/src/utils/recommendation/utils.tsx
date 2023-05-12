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
import { IRecommendationsStatic, IRecommendationContent } from 'uiSrc/slices/interfaces/recommendations'
import { ReactComponent as CodeIcon } from 'uiSrc/assets/img/code-changes.svg'
import { ReactComponent as ConfigurationIcon } from 'uiSrc/assets/img/configuration-changes.svg'
import { ReactComponent as UpgradeIcon } from 'uiSrc/assets/img/upgrade.svg'

import styles from './styles.module.scss'

const recommendationsContent = _content as IRecommendationsStatic

const badgesContent = [
  { id: 'code_changes', icon: <CodeIcon className={styles.badgeIcon} />, name: 'Code Changes' },
  { id: 'configuration_changes', icon: <ConfigurationIcon className={styles.badgeIcon} />, name: 'Configuration Changes' },
  { id: 'upgrade', icon: <UpgradeIcon className={styles.badgeIcon} />, name: 'Upgrade' },
]

const renderRecommendationBadges = (badges: string[]) => (
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

const renderRecommendationBadgesLegend = () => (
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

const replaceVariables = (value: any[] | any, parameter?: string[], params?: any) => (
  parameter && isString(value) ? value.replace(/\$\{\d}/g, (matched) => {
    const parameterIndex: string = matched.substring(
      matched.indexOf('{') + 1,
      matched.lastIndexOf('}')
    )
    return params[parameter[+parameterIndex]]
  }) : value
)

const renderContentElement = (
  { id, type, value: jsonValue, parameter }: IRecommendationContent,
  params: any,
  insights: boolean = false
) => {
  const value = replaceVariables(jsonValue, parameter, params)
  switch (type) {
    case 'paragraph':
      return (
        <EuiTextColor
          data-testid={`paragraph-${id}`}
          key={id}
          component="div"
          className={cx(styles.text, { [styles.insights]: insights })}
          color="subdued"
        >
          {value}
        </EuiTextColor>
      )
    case 'code':
      return (
        <EuiTextColor
          data-testid={`code-${id}`}
          className={cx(styles.code, { [styles.insights]: insights })}
          key={id}
          color="subdued"
        >
          <code className={cx(styles.span, styles.text)}>
            {value}
          </code>
        </EuiTextColor>
      )
    case 'span':
      return (
        <EuiTextColor
          data-testid={`span-${id}`}
          key={id}
          color="subdued"
          className={cx(styles.span, styles.text, { [styles.insights]: !!insights })}
        >
          {value}
        </EuiTextColor>
      )
    case 'link':
      return <EuiLink key={id} external={false} data-testid={`link-${id}`} target="_blank" href={value.href}>{value.name}</EuiLink>
    case 'code-link':
      return (
        <EuiLink key={id} external={false} data-testid={`link-${id}`} target="_blank" href={value.href}>
          <EuiTextColor
            className={cx(styles.code, { [styles.insights]: insights })}
            color="subdued"
          >
            <code className={cx(styles.span, styles.text)}>
              {value.name}
            </code>
          </EuiTextColor>
        </EuiLink>
      )
    case 'spacer':
      return <EuiSpacer data-testid={`spacer-${id}`} key={id} size={value as SpacerSize} />
    case 'list':
      return (
        <ul data-testid={`list-${id}`} key={id}>
          {isArray(jsonValue) && jsonValue.map((listElement: IRecommendationContent[]) => (
            <li key={`list-item-${listElement[0].id}`}>{renderRecommendationContent(listElement, params, insights)}</li>
          ))}
        </ul>
      )
    default:
      return value
  }
}

const renderRecommendationContent = (
  elements: IRecommendationContent[] = [],
  params: any,
  insights: boolean = false
) => (
  elements?.map((item) => renderContentElement(item, params, insights)))

const sortRecommendations = (recommendations: any[]) => sortBy(recommendations, [
  ({ name }) => name !== 'searchJSON',
  ({ name }) => name !== 'searchIndexes',
  ({ name }) => recommendationsContent[name]?.redisStack,
  ({ name }) => name,
])

export {
  sortRecommendations,
  renderRecommendationContent,
  replaceVariables,
  renderRecommendationBadgesLegend,
  renderRecommendationBadges,
}
