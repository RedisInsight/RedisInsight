import React from 'react'
import SettingsSvg from 'uiSrc/assets/img/sidebar/settings.svg?react'
import { Icon, IconProps } from 'uiSrc/components/base/icons'

export const SettingsIcon = (props: IconProps) => (
  <Icon icon={SettingsSvg} {...props} isSvg />
)
