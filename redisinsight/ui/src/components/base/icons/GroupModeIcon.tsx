import React from 'react'
import GroupModeSvg from 'uiSrc/assets/img/icons/group_mode.svg?react'
import { Icon, IconProps } from 'uiSrc/components/base/icons'

export const GroupModeIcon = (props: IconProps) => (
  <Icon icon={GroupModeSvg} {...props} isSvg />
)
