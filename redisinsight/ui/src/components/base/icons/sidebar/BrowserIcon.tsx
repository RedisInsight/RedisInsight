import React from 'react'
import BrowserSvg from 'uiSrc/assets/img/sidebar/browser.svg?react'
import { Icon, IconProps } from 'uiSrc/components/base/icons'

export const BrowserIcon = (props: IconProps) => (
  <Icon icon={BrowserSvg} {...props} isSvg />
)
