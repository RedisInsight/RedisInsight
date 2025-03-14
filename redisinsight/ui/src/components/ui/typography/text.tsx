import React from 'react'
import { Typography } from '@redislabsdev/redis-ui-components'

type Props = React.ComponentProps<typeof Typography.Body>
const Text = ({ children, ...props }: Props) => (
  <Typography.Body {...props}>{children}</Typography.Body>
)

export default Text
