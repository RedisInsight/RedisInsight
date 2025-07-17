import React from 'react'
import SnoozeSvg from 'uiSrc/assets/img/icons/snooze.svg?react'
import { Icon, IconProps } from 'uiSrc/components/base/icons'

export const SnoozeIcon = (props: IconProps) => (
  <Icon icon={SnoozeSvg} {...props} isSvg />
)
