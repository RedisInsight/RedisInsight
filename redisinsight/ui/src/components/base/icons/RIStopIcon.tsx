import React from 'react'
import StopIconSvg from 'uiSrc/assets/img/rdi/stopFilled.svg?react'
import { Icon, IconProps } from 'uiSrc/components/base/icons'

export const RiStopIcon = (props: IconProps) => (
  <Icon icon={StopIconSvg} {...props} isSvg />
)
