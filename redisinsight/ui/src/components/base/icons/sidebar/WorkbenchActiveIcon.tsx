import React from 'react'
import WorkbenchActiveSvg from 'uiSrc/assets/img/sidebar/workbench_active.svg?react'
import { Icon, IconProps } from 'uiSrc/components/base/icons'

export const WorkbenchActiveIcon = (props: IconProps) => (
  <Icon icon={WorkbenchActiveSvg} {...props} />
)
