import React from 'react'
import BrowserActiveSvg from 'uiSrc/assets/img/sidebar/browser_active.svg?react'
import { Icon, IconProps } from 'uiSrc/components/base/icons'

export const BrowserActiveIcon = (props: IconProps) => (
  <Icon icon={BrowserActiveSvg} {...props} />
)
