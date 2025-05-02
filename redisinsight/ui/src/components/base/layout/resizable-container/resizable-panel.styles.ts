import { CSSProperties, HTMLAttributes, ReactNode } from 'react'

export const PADDING_SIZES = ['none', 'xs', 's', 'm', 'l', 'xl'] as const
export type PaddingSize = (typeof PADDING_SIZES)[number]

export interface ResizablePanelProps {
  /**
   * Specify a desired minimum panel size in pixels or percents,
   * for example "300px" or "30%"
   * The actual minimum size will be calculated,
   * using the larger of this prop and the panelProps.paddingSize
   */
  minSize?: string
  /**
   * Specify id of panel if you want to track panel size in "onPanelWidthChange" callback
   */
  id?: string
  /**
   * Initial size of the panel in percents
   * Specify this prop if you don't need to handle the panel size from outside
   */
  initialSize?: number
  /**
   * Size of the panel in percents.
   * Specify this prop if you want to control the size from outside, the panel will ignore the "initialSize"
   */
  size?: number
  /**
   * Padding for all four sides
   */
  paddingSize: PaddingSize
  /**
   * Add Eui scroll and overflow for the panel
   */
  scrollable?: boolean
  /**
   * ReactNode to render as this component's content
   */
  children: ReactNode
  /**
   * Custom CSS properties applied to the wrapping `.euiResizablePanel` div
   */
  style?: CSSProperties
  /**
   * tabIndex={0} provides full keyboard access when content overflows `<EuiResizablePanel />`
   */
  tabIndex?: number
  /**
   * Props to add to the wrapping `.euiResizablePanel` div
   */
  wrapperProps?: HTMLAttributes<HTMLDivElement>
}
