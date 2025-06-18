import React from 'react'
import { EuiLink } from '@elastic/eui'
import { EuiLinkProps } from '@elastic/eui/src/components/link/link'
import { IconProps } from 'uiSrc/components/base/icons'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'

export type Props = EuiLinkProps & {
  href: string
  iconPosition?: 'left' | 'right'
  iconSize?: IconProps['size']
}

const ExternalLink = (props: Props) => {
  const { iconPosition = 'right', iconSize = 'M', children, ...rest } = props

  const ArrowIcon = () => (
    <RiIcon type="ArrowDiagonalIcon" size={iconSize} color="informative400" />
  )

  return (
    <EuiLink {...rest} external={false} target="_blank">
      {iconPosition === 'left' && <ArrowIcon />}
      {children}
      {iconPosition === 'right' && <ArrowIcon />}
    </EuiLink>
  )
}

export default ExternalLink
