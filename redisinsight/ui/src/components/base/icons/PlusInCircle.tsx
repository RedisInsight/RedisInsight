import React from 'react'
import PlusInCircleSvg from 'uiSrc/assets/img/icons/plus_in_circle.svg?react'
import { Icon, IconProps } from 'uiSrc/components/base/icons'

export const PlusInCircle = (props: IconProps) => (
  <Icon icon={PlusInCircleSvg} {...props} isSvg />
)
