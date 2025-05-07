import React from 'react'
import { MonochromeIconProps } from '@redislabsdev/redis-ui-icons'
import { useTheme } from '@redislabsdev/redis-ui-styles'

type BaseIconProps = MonochromeIconProps & {
  icon: React.ComponentType<any>
}
const sizesMap = {
  XS: 8,
  S: 12,
  M: 16,
  L: 20,
  XL: 24,
}

export const Icon = ({
  icon: IconComponent,
  customSize,
  customColor,
  title: titleProp,
  color = 'primary600',
  size = 'L',
  ...rest
}: BaseIconProps) => {
  const sizeValue = customSize || sizesMap[size]
  const theme = useTheme()
  const colorValue = customColor || theme.semantic.color.icon[color]
  const props = {
    color: colorValue,
    width: sizeValue,
    height: sizeValue,
    ...rest,
  }

  return <IconComponent {...props} />
}

export type IconProps = Omit<BaseIconProps, 'icon'>
