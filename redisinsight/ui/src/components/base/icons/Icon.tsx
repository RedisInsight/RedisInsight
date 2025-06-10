import React from 'react'
import { useTheme } from '@redis-ui/styles'
import { MonochromeIconProps } from 'uiSrc/components/base/icons'

type BaseIconProps = MonochromeIconProps & {
  icon: React.ComponentType<any>
  color?: keyof ReturnType<typeof useTheme>['semantic']['color']['icon']
}
const sizesMap = {
  XS: 8,
  S: 12,
  M: 16,
  L: 20,
  XL: 24,
}

/**
 * Type guard function to check if a color is a valid icon color in the theme
 * @param theme The current theme object
 * @param color The color string to check
 * @returns A boolean indicating if the color is valid and a type predicate
 */
function isValidIconColor(
  theme: ReturnType<typeof useTheme>,
  color: string | number | symbol,
): color is keyof typeof theme.semantic.color.icon {
  return color in theme.semantic.color.icon
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
  let colorValue = customColor
  if (!colorValue && isValidIconColor(theme, color)) {
    colorValue = theme.semantic.color.icon[color]
  }
  console.log({ theme, colorValue })

  const props = {
    customColor: colorValue,
    width: sizeValue,
    height: sizeValue,
    ...rest,
  }

  return <IconComponent {...props} />
}

export type IconProps = Omit<BaseIconProps, 'icon'>
