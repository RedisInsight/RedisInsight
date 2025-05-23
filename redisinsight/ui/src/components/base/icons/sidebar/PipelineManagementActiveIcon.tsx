import React from 'react'
import PipelineManagementActiveSvg from 'uiSrc/assets/img/sidebar/pipeline_active.svg?react'
import { Icon, IconProps } from 'uiSrc/components/base/icons'

export const PipelineManagementActiveIcon = (props: IconProps) => (
  <Icon icon={PipelineManagementActiveSvg} {...props} />
)
