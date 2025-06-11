import React from 'react'
import StarsSvg from 'uiSrc/assets/img/icons/stars.svg?react'
import { Icon, IconProps } from 'uiSrc/components/base/icons'

export const StarsIcon = (props: IconProps) => (
  <Icon icon={StarsSvg} {...props} isSvg />
)
