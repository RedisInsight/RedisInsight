import React from 'react'
import MinusInCircleSvg from 'uiSrc/assets/img/icons/minus_in_circle.svg?react'
import { Icon, IconProps } from 'uiSrc/components/base/icons'

export const MinusInCircleIcon = (props: IconProps) => (
  <Icon icon={MinusInCircleSvg} {...props} isSvg />
)
