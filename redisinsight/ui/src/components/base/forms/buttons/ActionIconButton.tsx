import React from 'react'
import { ActionIconButton as RedisUiActionIconButton } from '@redislabsdev/redis-ui-components'

export type ButtonProps = React.ComponentProps<typeof RedisUiActionIconButton>
export const ActionIconButton = (props: ButtonProps) => (
  <RedisUiActionIconButton {...props} />
)
