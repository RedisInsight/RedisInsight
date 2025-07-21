import React from 'react'
import { ColorText } from 'uiSrc/components/base/text'

import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import styles from './styles.module.scss'

export interface Props {
  title: string
  url: string
  description?: string
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void
  testId?: string
  styles?: any
}

const PromoLink = (props: Props) => {
  const { title, description, url, onClick, testId, styles: linkStyles } = props

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
      <RiIcon type="CloudIcon" size="m" className={styles.cloudIcon} />
      <ColorText color={linkStyles?.color} className={styles.title}>
        {title}
      </ColorText>
      <ColorText color={linkStyles?.color} className={styles.description}>
        {description}
      </ColorText>
    </a>
  )
}

export default PromoLink
