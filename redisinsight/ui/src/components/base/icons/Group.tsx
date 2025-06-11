import React from 'react'
import GroupModeIcon from 'uiSrc/assets/img/icons/group_mode.svg?react'
import { Icon, IconProps } from 'uiSrc/components/base/icons'

export const Group = (props: IconProps) => (
  <Icon icon={GroupModeIcon} {...props} isSvg />
)
