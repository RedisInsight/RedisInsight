import React from 'react'
import ResetSvg from 'uiSrc/assets/img/rdi/reset.svg?react'
import { Icon, IconProps } from 'uiSrc/components/base/icons'

export const RiResetIcon = (props: IconProps) => (
  <Icon icon={ResetSvg} {...props} isSvg />
)
