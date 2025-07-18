import React from 'react'
import { Icon, IconProps } from 'uiSrc/components/base/icons'
import ActiveActiveDark from 'uiSrc/assets/img/options/Active-ActiveDark.svg?react'
import ActiveActiveLight from 'uiSrc/assets/img/options/Active-ActiveLight.svg?react'
import RedisOnFlashDark from 'uiSrc/assets/img/options/RedisOnFlashDark.svg?react'
import RedisOnFlashLight from 'uiSrc/assets/img/options/RedisOnFlashLight.svg?react'

export const ActiveActiveDarkIcon = (props: IconProps) => (
  <Icon icon={ActiveActiveDark} {...props} isSvg />
)

export const ActiveActiveLightIcon = (props: IconProps) => (
  <Icon icon={ActiveActiveLight} {...props} isSvg />
)

export const RedisOnFlashDarkIcon = (props: IconProps) => (
  <Icon icon={RedisOnFlashDark} {...props} isSvg />
)

export const RedisOnFlashLightIcon = (props: IconProps) => (
  <Icon icon={RedisOnFlashLight} {...props} isSvg />
)
