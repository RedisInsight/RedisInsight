import React from 'react'

import DislikeSvg from 'uiSrc/assets/img/icons/dislike.svg?react'
import { Icon, IconProps } from 'uiSrc/components/base/icons'

export const DislikeIcon = (props: IconProps) => (
  <Icon icon={DislikeSvg} {...props} isSvg />
)
