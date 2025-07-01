import React from 'react'

import { TooltipProvider, Tooltip, TooltipProps } from '@redis-ui/components'
import { HoverContent } from './HoverContent'

interface RiTooltipProps extends TooltipProps {
  title?: React.ReactNode
  position?: TooltipProps['placement']
}

export const RiTooltip = ({
  children,
  title,
  content,
  position,
  ...props
}: RiTooltipProps) => (
  <TooltipProvider>
    <Tooltip
      {...props}
      content={<HoverContent title={title} content={content} />}
      placement={position}
    >
      <span>{children}</span>
    </Tooltip>
  </TooltipProvider>
)
