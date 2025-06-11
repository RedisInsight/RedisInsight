import React from 'react'
import ShrinkSvg from 'uiSrc/assets/img/icons/shrink.svg?react'
import { Icon, IconProps } from 'uiSrc/components/base/icons'

export const ShrinkIcon = (props: IconProps) => (
  <Icon icon={ShrinkSvg} {...props} isSvg />
)
