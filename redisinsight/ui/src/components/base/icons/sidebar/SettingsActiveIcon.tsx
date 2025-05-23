import React from 'react'
import SettingsActiveSvg from 'uiSrc/assets/img/sidebar/settings_active.svg?react'
import { Icon, IconProps } from 'uiSrc/components/base/icons'

export const SettingsActiveIcon = (props: IconProps) => (
  <Icon icon={SettingsActiveSvg} {...props} />
)
