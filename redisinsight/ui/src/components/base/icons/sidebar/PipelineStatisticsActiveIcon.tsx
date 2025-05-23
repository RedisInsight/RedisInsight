import React from 'react'
import PipelineStatisticsActiveSvg from 'uiSrc/assets/img/sidebar/pipeline_statistics_active.svg?react'
import { Icon, IconProps } from 'uiSrc/components/base/icons'

export const PipelineStatisticsActiveIcon = (props: IconProps) => (
  <Icon icon={PipelineStatisticsActiveSvg} {...props} />
)
