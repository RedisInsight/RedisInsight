import React from 'react'
import ExtendSvg from 'uiSrc/assets/img/icons/extend.svg?react'
import { Icon, IconProps } from 'uiSrc/components/base/icons'

export const ExtendIcon = (props: IconProps) => (
  <Icon icon={ExtendSvg} {...props} isSvg />
)
