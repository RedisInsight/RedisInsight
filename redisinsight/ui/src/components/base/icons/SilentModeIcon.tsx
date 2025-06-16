import React from 'react'

import SilentModeSvg from 'uiSrc/assets/img/icons/silent_mode.svg?react'
import { Icon, IconProps } from 'uiSrc/components/base/icons'

export const SilentModeIcon = (props: IconProps) => (
  <Icon icon={SilentModeSvg} {...props} isSvg />
)
