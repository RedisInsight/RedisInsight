import React from 'react'

import ExecutionTimeSvg from 'uiSrc/assets/img/workbench/execution_time.svg?react'
import { Icon, IconProps } from 'uiSrc/components/base/icons'

export const ExecutionTimeIcon = (props: IconProps) => (
  <Icon icon={ExecutionTimeSvg} {...props} isSvg />
)
