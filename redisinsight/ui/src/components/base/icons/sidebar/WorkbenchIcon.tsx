import React from 'react'
import WorkbenchSvg from 'uiSrc/assets/img/sidebar/workbench.svg?react'
import { Icon, IconProps } from 'uiSrc/components/base/icons'

export const WorkbenchIcon = (props: IconProps) => (
  <Icon icon={WorkbenchSvg} {...props} isSvg />
)
