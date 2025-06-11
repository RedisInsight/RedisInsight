import React from 'react'
import TriggerIcon from 'uiSrc/assets/img/bulb.svg?react'
import { Icon, IconProps } from 'uiSrc/components/base/icons'

export const Trigger = (props: IconProps) => (
  <Icon icon={TriggerIcon} {...props} isSvg />
)
