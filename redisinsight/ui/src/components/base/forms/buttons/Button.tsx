import { Button } from '@redislabsdev/redis-ui-components'
import React from 'react'
import { LoaderLargeIcon } from '@redislabsdev/redis-ui-icons/multicolor'
import {
  BaseButtonProps,
  IconContainer,
  IconSizes,
} from 'uiSrc/components/base/forms/buttons/button.styles'

export const BaseButton = ({
  children,
  icon,
  iconSide = 'left',
  loading,
  size = 'small',
  ...props
}: BaseButtonProps) => (
  <Button {...props} size={size} disabled={props.disabled || loading}>
    <ButtonIcon
      side="left"
      icon={icon}
      iconSide={iconSide}
      loading={loading}
      size={size}
    />
    {children}
    <ButtonIcon
      side="right"
      icon={icon}
      iconSide={iconSide}
      loading={loading}
      size={size}
    />
  </Button>
)

export type ButtonIconProps = Pick<
  BaseButtonProps,
  'icon' | 'iconSide' | 'loading' | 'size'
> & {
  side: 'left' | 'right'
}

const ButtonIcon = ({
  side,
  icon,
  iconSide,
  loading,
  size = 'medium',
}: ButtonIconProps) => {
  if (iconSide !== side) {
    return null
  }
  let renderIcon = icon
  if (loading) {
    renderIcon = LoaderLargeIcon
  }
  if (!renderIcon) {
    return null
  }
  return (
    <IconContainer left={side === 'left'} right={side === 'right'}>
      <Button.Icon icon={renderIcon} customSize={IconSizes[size] || '16px'} />
    </IconContainer>
  )
}
