import { theme, useTheme } from '@redis-ui/styles'
import { ReactNode } from 'react'
import styled, { css, keyframes } from 'styled-components'

export type EuiColorNames =
  | 'inherit'
  | 'default'
  | 'primary'
  | 'danger'
  | 'warning'
  | 'success'

interface LoaderBarProps {
  color?: string
}

export type ColorType = LoaderBarProps['color'] | EuiColorNames | (string & {})
type ThemeColors = typeof theme.semantic.color

export const getBarBackgroundColor = (
  color: ColorType,
  themeColors: ThemeColors,
) => {
  if (!color) {
    return themeColors.background.primary300
  }

  const barBackgroundColors: Map<ColorType, string> = new Map([
    ['inherit', 'inherit'],
    ['default', themeColors.background.primary300],
    ['primary', themeColors.background.primary300],
    ['danger', themeColors.background.danger600],
    ['warning', themeColors.background.attention600],
    ['success', themeColors.background.success600],
  ])

  return barBackgroundColors.get(color) ?? color
}

export interface MapProps extends LoaderBarProps {
  $color?: ColorType
}

export const useColorBackgroundStyles = ({ $color }: MapProps = {}) => {
  const theme = useTheme()
  const colors = theme.semantic.color

  const getColorValue = (color?: ColorType) =>
    getBarBackgroundColor(color, colors)

  return css`
    background-color: ${getColorValue($color)};
  `
}

const loading = keyframes`
  0% {
    transform: scaleX(1) translateX(-100%);
  }
  100% {
    transform: scaleX(1) translateX(100%);
  }
`

interface LoaderContainerProps {
  children?: ReactNode
  style?: React.CSSProperties
  className?: string
}

export const LoaderContainer = styled.div<LoaderContainerProps>`
  position: relative;
  height: 3px;
  background-color: #e6e6e6;
  overflow: hidden;
  border-radius: 2px;
`

export const LoaderBar = styled.div<MapProps>`
  ${useColorBackgroundStyles}

  position: absolute;
  height: 100%;
  width: 100%;
  border-radius: 2px;

  animation: ${loading} 1s ease-in-out infinite;
`

export type ProgressBarLoaderProps = LoaderContainerProps & LoaderBarProps
