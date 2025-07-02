import { SideBar } from '@redis-ui/components'
import styled, { css } from 'styled-components'

export type RiSideBarItemIconProps = Omit<
  React.ComponentProps<typeof SideBar.Item.Icon>,
  'width' | 'height'
> & {
  width?: string
  height?: string
}

export const StyledIcon = styled(SideBar.Item.Icon)<RiSideBarItemIconProps>`
  ${({ width = 'inherit' }) => css`
    width: ${width};
  `}
  ${({ height = 'inherit' }) => css`
    height: ${height};
  `}
`
