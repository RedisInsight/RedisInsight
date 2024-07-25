import React from 'react'
import { isArray, isString } from 'lodash'
import { EuiTextColor, EuiLink, EuiSpacer } from '@elastic/eui'
import { SpacerSize } from '@elastic/eui/src/components/spacer/spacer'
import cx from 'classnames'
import { OAuthSsoHandlerDialog, OAuthConnectFreeDb } from 'uiSrc/components'
import { getUtmExternalLink } from 'uiSrc/utils/links'
import { replaceVariables } from 'uiSrc/utils/recommendation'
import { IRecommendationContent } from 'uiSrc/slices/interfaces/recommendations'
import { OAuthSocialAction, OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { UTM_MEDIUMS } from 'uiSrc/constants/links'
import InternalLink from '../internal-link'
import RecommendationBody from '../recommendation-body'

import styles from '../styles.module.scss'

export interface Props {
  content: IRecommendationContent
  telemetryName: string
  params?: any
  onLinkClick?: () => void
  insights?: boolean
  idx: number
}

const ContentElement = (props: Props) => {
  const { content = {}, params, onLinkClick, telemetryName, insights, idx } = props
  const { type, value, parameter } = content

  const replacedValue = replaceVariables(value, parameter, params)

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
          className={cx(styles.span, styles.text, { [styles.insights]: insights })}
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
          href={getUtmExternalLink(value.href, { medium: UTM_MEDIUMS.Recommendation, campaign: telemetryName })}
          onClick={() => onLinkClick?.()}
        >
          {value.name}
        </EuiLink>
      )
    case 'link-sso':
      return (
        <OAuthSsoHandlerDialog>
          {(ssoCloudHandlerClick) => (
            <EuiLink
              key={`${telemetryName}-${idx}`}
              external={false}
              data-testid={`link-sso-${telemetryName}-${idx}`}
              target="_blank"
              onClick={(e) => {
                ssoCloudHandlerClick?.(e, {
                  source: telemetryName as OAuthSocialSource,
                  action: OAuthSocialAction.Create
                })
              }}
              href={getUtmExternalLink(value.href, { medium: UTM_MEDIUMS.Recommendation, campaign: telemetryName })}
            >
              {value.name}
            </EuiLink>
          )}
        </OAuthSsoHandlerDialog>
      )
    case 'connect-btn':
      return (
        <OAuthConnectFreeDb source={telemetryName as OAuthSocialSource} />
      )
    case 'code-link':
      return (
        <EuiLink
          key={`${telemetryName}-${idx}`}
          external={false}
          data-testid={`code-link-${telemetryName}-${idx}`}
          target="_blank"
          href={getUtmExternalLink(value.href, { medium: UTM_MEDIUMS.Recommendation, campaign: telemetryName })}
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
        <ul
          className={styles.list}
          data-testid={`list-${telemetryName}-${idx}`}
          key={`${telemetryName}-${idx}`}
        >
          {isArray(value) && value.map((listElement: IRecommendationContent[], idx: number) => (
            <li
              className={cx(styles.listItem, { [styles.insights]: insights })}
              // eslint-disable-next-line react/no-array-index-key
              key={`list-item-${idx}`}
            >
              <RecommendationBody
                elements={listElement}
                params={params}
                telemetryName={telemetryName}
                onLinkClick={onLinkClick}
                insights={insights}
              />
            </li>
          ))}
        </ul>
      )
    case 'internal-link':
      return (
        <InternalLink
          key={`${telemetryName}-${idx}`}
          dataTestid={`internal-link-${telemetryName}-${idx}`}
          path={replacedValue.path}
          text={replacedValue.name}
        />
      )
    default:
      return isString(value) ? <>{value}</> : <b>*Unknown format*</b>
  }
}

export default ContentElement
