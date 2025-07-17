import React from 'react'
import { Icon, IconProps } from 'uiSrc/components/base/icons'
import BanIconSvg from 'uiSrc/assets/img/monitor/ban.svg?react'

export const BannedIcon = (props: IconProps) => (
  <Icon icon={BanIconSvg} {...props} isSvg />
)
