import React from 'react'
import { useTheme } from '@redis-ui/styles'
import cx from 'classnames'
import { MonochromeIconProps } from 'uiSrc/components/base/icons'

type BaseIconProps = Omit<MonochromeIconProps, 'color'> & {
  icon: React.ComponentType<any>
  color?:
    | keyof ReturnType<typeof useTheme>['semantic']['color']['icon']
    | 'currentColor'
    | (string & {})
  isSvg?: boolean
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
  isSvg = false,
  customSize,
  customColor,
  color = 'primary600',
  size = 'L',
  className,
  ...rest
}: BaseIconProps) => {
  const sizeValue = customSize || sizesMap[size]
  const theme = useTheme()
  let colorValue = customColor
  if (!colorValue && isValidIconColor(theme, color)) {
    colorValue = theme.semantic.color.icon[color]
  } else if (color === 'currentColor') {
    colorValue = 'currentColor'
  }

  const svgProps = {
    color: colorValue,
    fill: colorValue,
    width: sizeValue,
    height: sizeValue,
    ...rest,
  }

  const props = isSvg
    ? svgProps
    : { color, customColor, size, customSize, ...rest }

  return <IconComponent {...props} className={cx(className, 'RI-Icon')} />
}

export type IconProps = Omit<BaseIconProps, 'icon'>
