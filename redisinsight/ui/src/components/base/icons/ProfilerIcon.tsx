import React from 'react'
import ProfilerSvg from 'uiSrc/assets/img/icons/profiler.svg?react'
import { Icon, IconProps } from 'uiSrc/components/base/icons'

export const ProfilerIcon = (props: IconProps) => (
  <Icon icon={ProfilerSvg} {...props} isSvg />
)
