import React from 'react'
import PipelineStatisticsSvg from 'uiSrc/assets/img/sidebar/pipeline_statistics.svg?react'
import { Icon, IconProps } from 'uiSrc/components/base/icons'

export const PipelineStatisticsIcon = (props: IconProps) => (
  <Icon icon={PipelineStatisticsSvg} {...props} isSvg />
)
