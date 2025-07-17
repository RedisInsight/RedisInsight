import React from 'react'
import GithubSvg from 'uiSrc/assets/img/sidebar/github.svg?react'
import { Icon, IconProps } from 'uiSrc/components/base/icons'

export const GithubIcon = (props: IconProps) => (
  <Icon icon={GithubSvg} {...props} isSvg />
)
