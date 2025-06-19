import React from 'react'
import { Link as RedisUiLink } from '@redis-ui/components'
import { RiLinkProps, StyledLink } from './link.styles'

export type LinkProps = React.ComponentProps<typeof RedisUiLink>
export const Link = ({ color, ...rest }: RiLinkProps) => <StyledLink $color={color} {...rest} />
