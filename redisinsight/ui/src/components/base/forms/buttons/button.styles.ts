import React from 'react'
import { Button } from '@redislabsdev/redis-ui-components'
import { IconType } from 'uiSrc/components/base/icons'

export type BaseButtonProps = React.ComponentProps<typeof Button> & {
  icon?: IconType
  iconSide?: 'left' | 'right'
  loading?: boolean
}
export type ButtonProps = Omit<BaseButtonProps, 'variant'>
export type SecondaryButtonProps = ButtonProps & {
  filled?: boolean
  inverted?: boolean
}
export type OutlineButtonProps = Omit<
  SecondaryButtonProps,
  'filled' | 'inverted'
>
