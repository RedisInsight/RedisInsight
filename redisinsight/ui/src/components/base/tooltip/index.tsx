import React from 'react'

import { TooltipProvider, Tooltip, TooltipProps } from '@redis-ui/components'
import { HoverContent } from './HoverContent'

export interface RiTooltipProps
  extends Omit<TooltipProps, 'placement' | 'openDelayDuration'> {
  title?: React.ReactNode
  position?: TooltipProps['placement']
  delay?: TooltipProps['openDelayDuration']
}

export const RiTooltip = ({
  children,
  title,
  content,
  position,
  delay,
  ...props
}: RiTooltipProps) => (
  <TooltipProvider>
    <Tooltip
      {...props}
      content={<HoverContent title={title} content={content} />}
      placement={position}
      openDelayDuration={delay}
    >
      <span>{children}</span>
    </Tooltip>
  </TooltipProvider>
)
