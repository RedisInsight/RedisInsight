import React from 'react'
import UserInCircleSvg from 'uiSrc/assets/img/icons/user_in_circle.svg?react'
import { Icon, IconProps } from 'uiSrc/components/base/icons'

export const UserInCircle = (props: IconProps) => (
  <Icon icon={UserInCircleSvg} {...props} isSvg />
)
