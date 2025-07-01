import React from 'react'

import { RiSideBarItemIconProps, StyledIcon } from './sidebar-item-icon.styles'

export const SideBarItemIcon = ({ width, height, ...props }: RiSideBarItemIconProps) => (
  <StyledIcon {...props} width={width} height={height} />
)
