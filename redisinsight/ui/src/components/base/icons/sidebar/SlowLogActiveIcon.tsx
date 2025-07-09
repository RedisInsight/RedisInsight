import React from 'react'
import SlowLogActiveSvg from 'uiSrc/assets/img/sidebar/slowlog_active.svg?react'
import { Icon, IconProps } from 'uiSrc/components/base/icons'

export const SlowLogActiveIcon = (props: IconProps) => (
  <Icon icon={SlowLogActiveSvg} {...props} />
)
