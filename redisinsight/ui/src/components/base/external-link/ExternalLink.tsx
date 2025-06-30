import React from 'react'
import { EuiIcon } from '@elastic/eui'
import { EuiLinkProps } from '@elastic/eui/src/components/link/link'

import { IconSize } from '@elastic/eui/src/components/icon/icon'
import { Link } from 'uiSrc/components/base/link/Link'
import styles from './styles.module.scss'

export type Props = EuiLinkProps & {
  href: string
  iconPosition?: 'left' | 'right'
  iconSize?: IconSize
}

const ExternalLink = (props: Props) => {
  const { iconPosition = 'right', iconSize = 'm', children, ...rest } = props

  const ArrowIcon = () => (
    <EuiIcon type="sortUp" size={iconSize} className={styles.linkIcon} />
  )

  return (
    <Link {...rest} target="_blank">
      {iconPosition === 'left' && <ArrowIcon />}
      {children}
      {iconPosition === 'right' && <ArrowIcon />}
    </Link>
  )
}

export default ExternalLink
