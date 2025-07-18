import React from 'react'
import PipelineManagementSvg from 'uiSrc/assets/img/sidebar/pipeline.svg?react'
import { Icon, IconProps } from 'uiSrc/components/base/icons'

export const PipelineManagementIcon = (props: IconProps) => (
  <Icon icon={PipelineManagementSvg} {...props} isSvg />
)
