import React from 'react'
import { Button } from '@redislabsdev/redis-ui-components'
import { buttonSizes } from '@redislabsdev/redis-ui-components/dist/Button/Button.types'
import { IconType } from 'uiSrc/components/base/icons'

export type BaseButtonProps = Omit<
  React.ComponentProps<typeof Button>,
  'size'
> & {
  icon?: IconType
  iconSide?: 'left' | 'right'
  loading?: boolean
  size?: (typeof buttonSizes)[number] | 's' | 'm' | 'l'
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
