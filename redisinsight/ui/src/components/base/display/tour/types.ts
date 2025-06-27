import React, { ReactNode } from 'react'
import { Popover } from '@redis-ui/components'

export type TourStepProps = {
  /**
   * Contents of the tour step popover
   */
  content: ReactNode
  /**
   * Step will display if set to `true`
   */
  open?: boolean
  /**
   * Function to call for 'Skip tour' and 'End tour' actions
   */
  onClose?: () => void
  /**
   * The title text that appears atop each step in the tour. The subtitle gets wrapped in the appropriate heading level.
   */
  title?: ReactNode
  // placement?: 'top' | 'bottom' | 'left' | 'right'
  placement?:
    | 'upCenter'
    | 'upLeft'
    | 'upRight'
    | 'downCenter'
    | 'downLeft'
    | 'downRight'
    | 'leftCenter'
    | 'leftUp'
    | 'leftDown'
    | 'rightCenter'
    | 'rightUp'
    | 'rightDown'
  className?: string
  children?: ReactNode
  minWidth?: number | string
  maxWidth?: number | string
  offset?: number
}
type PopoverTypes = React.ComponentProps<typeof Popover>

export type PopoverPlacementMapType = Record<
  NonNullable<TourStepProps['placement']>,
  {
    placement: PopoverTypes['placement']
    align: PopoverTypes['align']
  }
>
