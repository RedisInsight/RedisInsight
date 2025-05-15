import React from 'react'
import { Link as RedisUiLink } from '@redis-ui/components'

export type LinkProps = React.ComponentProps<typeof RedisUiLink>
export const Link = (props: LinkProps) => <RedisUiLink {...props} />
