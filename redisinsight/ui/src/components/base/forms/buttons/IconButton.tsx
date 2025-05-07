import React from 'react'
import { IconButton as RedisUiIconButton } from '@redislabsdev/redis-ui-components'

export type ButtonProps = React.ComponentProps<typeof RedisUiIconButton>
export const IconButton = (props: ButtonProps) => (
  <RedisUiIconButton {...props} />
)
