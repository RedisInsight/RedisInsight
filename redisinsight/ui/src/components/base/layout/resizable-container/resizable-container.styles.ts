import { ComponentType, CSSProperties, HTMLAttributes, ReactNode } from 'react'
import { ResizablePanelProps } from './resizable-panel.styles'
import { ResizableButtonProps } from './resizable-button.styles'

export interface ResizableContainerProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /**
   * Specify the container direction
   */
  direction?: 'vertical' | 'horizontal'
  /**
   * Pure function which accepts Panel and Resizer components in arguments
   * and returns a component tree
   */
  children: (
    Panel: ComponentType<ResizablePanelProps>,
    Resizer: ComponentType<ResizableButtonProps>,
  ) => ReactNode
  /**
   * Pure function which accepts an object where keys are IDs of panels, which sizes were changed,
   * and values are actual sizes in percents
   */
  onPanelWidthChange?: (newSizes: { [key: string]: number }) => void
  style?: CSSProperties
}
