import React from 'react'
import PlayFilledSvg from 'uiSrc/assets/img/icons/play-filled.svg?react'
import { Icon, IconProps } from 'uiSrc/components/base/icons'

export const PlayFilledIcon = (props: IconProps) => (
  <Icon icon={PlayFilledSvg} {...props} isSvg />
)
