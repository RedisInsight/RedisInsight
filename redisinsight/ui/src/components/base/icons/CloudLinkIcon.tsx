import React from 'react'

import { Icon, IconProps } from 'uiSrc/components/base/icons'
import CloudLinkSvg from 'uiSrc/assets/img/oauth/cloud_link.svg?react'

export const CloudLinkIcon = (props: IconProps) => (
  <Icon icon={CloudLinkSvg} {...props} isSvg />
)
