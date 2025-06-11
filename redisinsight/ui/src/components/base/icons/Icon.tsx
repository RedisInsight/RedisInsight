import React from 'react'
import { useTheme } from '@redis-ui/styles'
import { MonochromeIconProps } from 'uiSrc/components/base/icons'

type BaseIconProps = Omit<MonochromeIconProps, 'color'> & {
  icon: React.ComponentType<any>
  color?:
    | keyof ReturnType<typeof useTheme>['semantic']['color']['icon']
    | 'currentColor'
    | (string & {})
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
  customColor,
  color = 'primary600',
  ...rest
}: BaseIconProps) => {
  const theme = useTheme()
  const colorValue = customColor

  const props: IconProps = {
    customColor: colorValue,
    ...rest,
  }
  if (!colorValue && isValidIconColor(theme, color)) {
    props.color = theme.semantic.color.icon[color]
  } else if (color === 'currentColor' && !customColor) {
    props.customColor = 'currentColor'
  }

  return <IconComponent {...props} />
}

export type IconProps = Omit<BaseIconProps, 'icon'>
