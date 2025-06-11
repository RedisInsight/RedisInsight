import React from 'react'
import SlowLogSvg from 'uiSrc/assets/img/sidebar/slowlog.svg?react'
import { Icon, IconProps } from 'uiSrc/components/base/icons'

export const SlowLogIcon = (props: IconProps) => (
  <Icon icon={SlowLogSvg} {...props} isSvg />
)
