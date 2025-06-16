import React from 'react'

import DefaultPluginDarkSvg from 'uiSrc/assets/img/workbench/default_view_dark.svg?react'
import { Icon, IconProps } from 'uiSrc/components/base/icons'

export const DefaultPluginDarkIcon = (props: IconProps) => (
  <Icon icon={DefaultPluginDarkSvg} {...props} isSvg />
)
