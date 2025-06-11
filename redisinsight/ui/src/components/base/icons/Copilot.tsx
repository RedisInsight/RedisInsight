import React from 'react'
import CopilotSvg from 'uiSrc/assets/img/icons/copilot.svg?react'
import { Icon, IconProps } from 'uiSrc/components/base/icons'

export const CopilotIcon = (props: IconProps) => (
  <Icon icon={CopilotSvg} {...props} isSvg />
)
