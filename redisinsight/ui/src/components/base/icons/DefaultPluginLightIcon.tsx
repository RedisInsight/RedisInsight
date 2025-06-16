import React from 'react'

import DefaultPluginLightSvg from 'uiSrc/assets/img/workbench/default_view_light.svg?react'
import { Icon, IconProps } from 'uiSrc/components/base/icons'

export const DefaultPluginLightIcon = (props: IconProps) => (
  <Icon icon={DefaultPluginLightSvg} {...props} isSvg />
)
