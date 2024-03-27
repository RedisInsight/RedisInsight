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
import { IRecommendationsStatic, IRecommendationContent } from 'uiSrc/slices/interfaces/recommendations'
import { OAuthConnectFreeDb, OAuthSsoHandlerDialog } from 'uiSrc/components'
import { OAuthSocialAction, OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { ReactComponent as CodeIcon } from 'uiSrc/assets/img/code-changes.svg'
import { ReactComponent as ConfigurationIcon } from 'uiSrc/assets/img/configuration-changes.svg'
import { ReactComponent as UpgradeIcon } from 'uiSrc/assets/img/upgrade.svg'

import { getUtmExternalLink } from 'uiSrc/utils/links'
import styles from './styles.module.scss'

const utmMedium = 'recommendation'

interface ITelemetry {
  telemetryName: string
  onClickLink?: () => void
}

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
  { type, value: jsonValue, parameter }: IRecommendationContent,
  params: any,
  telemetry: ITelemetry,
  insights: boolean,
  idx: number
) => {
  const value = replaceVariables(jsonValue, parameter, params)
  switch (type) {
    case 'paragraph':
      return (
        <EuiTextColor
          data-testid={`paragraph-${telemetry.telemetryName}-${idx}`}
          key={`${telemetry.telemetryName}-${idx}`}
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
          data-testid={`code-${telemetry.telemetryName}-${idx}`}
          className={cx(styles.code, { [styles.insights]: insights })}
          key={`${telemetry.telemetryName}-${idx}`}
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
          data-testid={`span-${telemetry.telemetryName}-${idx}`}
          key={`${telemetry.telemetryName}-${idx}`}
          color="subdued"
          className={cx(styles.span, styles.text, { [styles.insights]: !!insights })}
        >
          {value}
        </EuiTextColor>
      )
    case 'link':
      return (
        <EuiLink
          key={`${telemetry.telemetryName}-${idx}`}
          external={false}
          data-testid={`link-${telemetry.telemetryName}-${idx}`}
          target="_blank"
          href={getUtmExternalLink(value.href, { medium: utmMedium, campaign: telemetry.telemetryName })}
          onClick={() => telemetry.onClickLink?.()}
        >
          {value.name}
        </EuiLink>
      )
    case 'link-sso':
      return (
        <OAuthSsoHandlerDialog>
          {(ssoCloudHandlerClick) => (
            <EuiLink
              key={`${telemetry.telemetryName}-${idx}`}
              external={false}
              data-testid={`link-sso-${telemetry.telemetryName}-${idx}`}
              target="_blank"
              onClick={(e) => {
                ssoCloudHandlerClick?.(e, {
                  source: telemetry.telemetryName as OAuthSocialSource,
                  action: OAuthSocialAction.Create
                })
              }}
              href={getUtmExternalLink(value.href, { medium: utmMedium, campaign: telemetry.telemetryName })}
            >
              {value.name}
            </EuiLink>
          )}
        </OAuthSsoHandlerDialog>
      )
    case 'connect-btn':
      return (
        <OAuthConnectFreeDb source={telemetry.telemetryName as OAuthSocialSource} />
      )
    case 'code-link':
      return (
        <EuiLink
          key={`${telemetry.telemetryName}-${idx}`}
          external={false}
          data-testid={`code-link-${telemetry.telemetryName}-${idx}`}
          target="_blank"
          href={getUtmExternalLink(value.href, { medium: utmMedium, campaign: telemetry.telemetryName })}
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
          data-testid={`spacer-${telemetry.telemetryName}-${idx}`}
          key={`${telemetry.telemetryName}-${idx}`}
          size={value as SpacerSize}
        />
      )
    case 'list':
      return (
        <ul
          className={styles.list}
          data-testid={`list-${telemetry.telemetryName}-${idx}`}
          key={`${telemetry.telemetryName}-${idx}`}
        >
          {isArray(jsonValue) && jsonValue.map((listElement: IRecommendationContent[], idx) => (
            <li
              className={cx(styles.listItem, { [styles.insights]: insights })}
              // eslint-disable-next-line react/no-array-index-key
              key={`list-item-${listElement[0]}-${idx}`}
            >
              {renderRecommendationContent(listElement, params, telemetry, insights)}
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
  telemetry: ITelemetry,
  insights: boolean = false
) => (
  elements?.map((item, idx) => renderContentElement(item, params, telemetry, insights, idx)))

const sortRecommendations = (recommendations: any[], recommendationsContent: IRecommendationsStatic) =>
  sortBy(recommendations, [
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
