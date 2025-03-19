import React from 'react'
import { Typography } from '@redislabsdev/redis-ui-components'

type TextProps = React.ComponentProps<typeof Typography.Body>
type HeadingProps = React.ComponentProps<typeof Typography.Heading>
const Text = ({ children, ...props }: TextProps) => (
  <Typography.Body {...props}>{children}</Typography.Body>
)

const Heading = ({ children, ...props }: HeadingProps) => (
  <Typography.Heading {...props}>{children}</Typography.Heading>
)

export { Text, Heading }
