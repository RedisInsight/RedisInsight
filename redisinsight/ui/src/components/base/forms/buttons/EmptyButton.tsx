import React from 'react'
import { TextButton } from '@redislabsdev/redis-ui-components'
import { ButtonIcon } from 'uiSrc/components/base/forms/buttons/Button'
import { IconType } from 'uiSrc/components/base/icons'

export type ButtonProps = React.ComponentProps<typeof TextButton> & {
  icon?: IconType
  iconSide?: 'left' | 'right'
  loading?: boolean
  size?: 'small' | 'large' | 'medium'
}
export const EmptyButton = ({
  children,
  icon,
  iconSide = 'left',
  loading,
  size = 'small',
  ...rest
}: ButtonProps) => (
  <TextButton {...rest}>
    <ButtonIcon
      buttonSide="left"
      icon={icon}
      iconSide={iconSide}
      loading={loading}
      size={size}
    />
    {children}
    <ButtonIcon
      buttonSide="right"
      icon={icon}
      iconSide={iconSide}
      loading={loading}
      size={size}
    />
  </TextButton>
)
