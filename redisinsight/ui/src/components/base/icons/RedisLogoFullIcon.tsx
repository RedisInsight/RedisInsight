import React from 'react'
import RedisLogoSvg from 'uiSrc/assets/img/logo.svg?react'
import { Icon, IconProps } from 'uiSrc/components/base/icons'

export const RedisLogoFullIcon = (props: IconProps) => (
  <Icon icon={RedisLogoSvg} {...props} isSvg />
)
