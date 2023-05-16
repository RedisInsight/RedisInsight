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

const utmSource = 'redisinsight'
const utmMedium = 'recommendation'

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

const addUtmToLink = (href: string, telemetryName: string): string => {
  try {
    const url = new URL(href)
    url.searchParams.append('utm_source', utmSource)
    url.searchParams.append('utm_medium', utmMedium)
    url.searchParams.append('utm_campaign', telemetryName)
    return url.toString()
  } catch (e) {
    // ignore errors
    return href
  }
}

const renderContentElement = (
  { type, value: jsonValue, parameter }: IRecommendationContent,
  params: any,
  telemetryName: string,
  insights: boolean,
  idx: number
) => {
  const value = replaceVariables(jsonValue, parameter, params)
  switch (type) {
    case 'paragraph':
      return (
        <EuiTextColor
          data-testid={`paragraph-${telemetryName}-${idx}`}
          key={`${telemetryName}-${idx}`}
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
          data-testid={`code-${telemetryName}-${idx}`}
          className={cx(styles.code, { [styles.insights]: insights })}
          key={`${telemetryName}-${idx}`}
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
          data-testid={`span-${telemetryName}-${idx}`}
          key={`${telemetryName}-${idx}`}
          color="subdued"
          className={cx(styles.span, styles.text, { [styles.insights]: !!insights })}
        >
          {value}
        </EuiTextColor>
      )
    case 'link':
      return (
        <EuiLink
          key={`${telemetryName}-${idx}`}
          external={false}
          data-testid={`link-${telemetryName}-${idx}`}
          target="_blank"
          href={addUtmToLink(value.href, telemetryName)}
        >
          {value.name}
        </EuiLink>
      )
    case 'code-link':
      return (
        <EuiLink
          key={`${telemetryName}-${idx}`}
          external={false}
          data-testid={`code-link-${telemetryName}-${idx}`}
          target="_blank"
          href={addUtmToLink(value.href, telemetryName)}
        >
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
      return (
        <EuiSpacer
          data-testid={`spacer-${telemetryName}-${idx}`}
          key={`${telemetryName}-${idx}`}
          size={value as SpacerSize}
        />
      )
    case 'list':
      return (
        <ul className={styles.list} data-testid={`list-${telemetryName}-${idx}`} key={`${telemetryName}-${idx}`}>
          {isArray(jsonValue) && jsonValue.map((listElement: IRecommendationContent[], idx) => (
            <li
              className={cx(styles.listItem, { [styles.insights]: insights })}
              // eslint-disable-next-line react/no-array-index-key
              key={`list-item-${listElement[0]}-${idx}`}
            >
              {renderRecommendationContent(listElement, params, telemetryName, insights)}
            </li>
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
  telemetryName: string,
  insights: boolean = false
) => (
  elements?.map((item, idx) => renderContentElement(item, params, telemetryName, insights, idx)))

const sortRecommendations = (recommendations: any[]) => sortBy(recommendations, [
  ({ name }) => name !== 'searchJSON',
  ({ name }) => name !== 'searchIndexes',
  ({ name }) => recommendationsContent[name]?.redisStack,
  ({ name }) => name,
])

export {
  addUtmToLink,
  sortRecommendations,
  renderRecommendationContent,
  replaceVariables,
  renderRecommendationBadgesLegend,
  renderRecommendationBadges,
}
