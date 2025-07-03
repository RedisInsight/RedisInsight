import styled, { css } from 'styled-components'
import { Link as RedisUiLink, LinkProps } from '@redis-ui/components'
import { useTheme, theme } from '@redis-ui/styles'

// TODO [DA]: Export the color functionality and use both for Link and Text
export type EuiColorNames =
  | 'inherit'
  | 'default'
  | 'primary'
  | 'text'
  | 'subdued'
  | 'danger'
  | 'ghost'
  | 'accent'
  | 'warning'
  | 'success'

export type ColorType = LinkProps['color'] | EuiColorNames | (string & {})

export type RiLinkProps = Omit<LinkProps, 'color'> & {
  color?: ColorType
}

export interface MapProps extends RiLinkProps {
  $color?: ColorType
}

type ThemeColors = typeof theme.semantic.color

export const getLinkColor = (color: ColorType, themeColors: ThemeColors) => {
  if (!color) {
    return themeColors.text.primary500
  }

  const linkColorsMap: Map<ColorType, string> = new Map([
    ['inherit', 'inherit'],
    ['default', themeColors.text.primary500],
    ['primary', themeColors.text.primary500],
    ['text', themeColors.text.neutral700],
    ['subdued', themeColors.text.informative400],
    ['danger', themeColors.text.danger600],
    ['ghost', themeColors.text.neutral600],
    ['accent', themeColors.text.notice600],
    ['warning', themeColors.text.attention600],
    ['success', themeColors.text.success600],
  ])

  return linkColorsMap.get(color) ?? color
}

export const useColorTextStyles = ({ $color }: MapProps = {}) => {
  const theme = useTheme()
  const colors = theme.semantic.color

  const getColorValue = (color?: ColorType) => getLinkColor(color, colors)

  return css`
    color: ${getColorValue($color)};
  `
}

export const StyledLink = styled(RedisUiLink)<MapProps>`
  ${useColorTextStyles};

  text-decoration: underline !important;

  &:hover {
    text-decoration: none !important;
  }
`
