import React from 'react'

import ThreeDotsSvg from 'uiSrc/assets/img/icons/three_dots.svg?react'
import { Icon, IconProps } from 'uiSrc/components/base/icons/Icon'

export const ThreeDotsIcon = (props: IconProps) => (
  <Icon icon={ThreeDotsSvg} {...props} />
)
