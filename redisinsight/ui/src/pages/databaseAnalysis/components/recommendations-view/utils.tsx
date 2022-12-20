import React from 'react'
import {
  EuiTextColor,
  EuiToolTip,
  EuiFlexGroup,
  EuiFlexItem,
  EuiLink,
  EuiSpacer,
} from '@elastic/eui'
import cx from 'classnames'
import { ReactComponent as CodeIcon } from 'uiSrc/assets/img/code-changes.svg'
import { ReactComponent as ConfigurationIcon } from 'uiSrc/assets/img/configuration-changes.svg'
import { ReactComponent as UpgradeIcon } from 'uiSrc/assets/img/upgrade.svg'

import styles from './styles.module.scss'

interface IContentElement {
  id: string
  type: string
  value: any[]
}

const badgesContent = [
  { id: 'code_changes', icon: <CodeIcon className={styles.badgeIcon} />, name: 'Code Changes' },
  { id: 'configuration_changes', icon: <ConfigurationIcon className={styles.badgeIcon} />, name: 'Configuration Changes' },
  { id: 'upgrade', icon: <UpgradeIcon className={styles.badgeIcon} />, name: 'Upgrade' },
]

export const renderBadges = (badges: string[]) => (
  <EuiFlexGroup className={styles.badgesContainer} responsive={false} alignItems="center" justifyContent="spaceBetween">
    {badgesContent.map(({ id, name, icon }) => (badges.indexOf(id) === -1
      ? null
      : (
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

const renderContentElement = ({ id, type, value }: IContentElement) => {
  switch (type) {
    case 'paragraph':
      return <EuiTextColor key={id} component="div" className={styles.text} color="subdued">{value}</EuiTextColor>
    case 'span':
      return <EuiTextColor key={id} color="subdued" className={cx(styles.span, styles.text)}>{value}</EuiTextColor>
    case 'link':
      return <EuiLink key={id} external={false} data-testid="read-more-link" target="_blank" href={value.href}>{value.name}</EuiLink>
    case 'spacer':
      return <EuiSpacer key={id} size={value} />
    case 'list':
      return (
        <ul key={id}>
          {value.map((listElement: IContentElement[]) => (
            <li>{renderContent(listElement)}</li>
          ))}
        </ul>
      )
    default:
      return value
  }
}

export const renderContent = (elements: IContentElement[]) => (
  elements?.map((item) => renderContentElement(item)))
