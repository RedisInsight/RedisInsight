import React from 'react'
import RawModeIcon from 'uiSrc/assets/img/icons/raw_mode.svg?react'
import { Icon, IconProps } from 'uiSrc/components/base/icons'

export const RawMode = (props: IconProps) => (
  <Icon icon={RawModeIcon} {...props} isSvg />
)
