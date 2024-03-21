import React from 'react'
import { EuiIcon, EuiText } from '@elastic/eui'

import { Nullable } from 'uiSrc/utils'
import { ReactComponent as CloudIcon } from 'uiSrc/assets/img/oauth/cloud_color.svg'

import styles from './styles.module.scss'

export interface Props {
  title: string
  url: string
  description?: string
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void
  testId?: string
  icon?: Nullable<string>
  styles?: any
}

const PromoLink = (props: Props) => {
  const { title, description, url, onClick, testId, icon, styles: linkStyles } = props

  return (
    <a
      className={styles.link}
      href={url}
      target="_blank"
      rel="noreferrer"
      onClick={onClick}
      data-testid={testId}
      style={{ ...linkStyles }}
    >
      <EuiIcon type={CloudIcon} size="m" className={styles.cloudIcon} />
      <EuiText className={styles.title}>
        <span style={{ color: linkStyles?.color }}>{title}</span>
      </EuiText>
      <EuiText className={styles.description}>
        <span style={{ color: linkStyles?.color }}>{description}</span>
      </EuiText>
    </a>
  )
}

export default PromoLink
