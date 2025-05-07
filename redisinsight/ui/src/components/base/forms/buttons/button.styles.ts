import React from 'react'
import { Button } from '@redislabsdev/redis-ui-components'
import { IconType } from '@redislabsdev/redis-ui-icons'
import styled from 'styled-components'

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
export const IconSizes = {
  small: '16px',
  medium: '20px',
  large: '24px',
}

export const IconContainer = styled.span<{
  left?: boolean
  right?: boolean
  children: React.ReactNode
}>`
  display: inline-block;
  margin-right: ${(props) => (props.left ? '5px' : '0')};
  margin-left: ${(props) => (props.right ? '5px' : '0')};
`
