import React from 'react'
import RedisLogoSvg from 'uiSrc/assets/img/logo_small.svg?react'
import { Icon, IconProps } from 'uiSrc/components/base/icons'

export const RedisLogo = (props: IconProps) => (
  <Icon icon={RedisLogoSvg} {...props} isSvg />
)
