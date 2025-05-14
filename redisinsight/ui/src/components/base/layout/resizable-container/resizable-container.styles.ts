import {
  ButtonHTMLAttributes,
  ComponentType,
  CSSProperties,
  HTMLAttributes,
  ReactNode,
} from 'react'
import styled, { css } from 'styled-components'

import { ResizablePanelProps } from './resizable-panel.styles'
import { ResizableContainerActions } from './types'

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
    Resizer: ComponentType<ButtonHTMLAttributes<HTMLButtonElement>>,
    actions: Partial<ResizableContainerActions>,
  ) => ReactNode
  /**
   * Pure function which accepts an object where keys are IDs of panels, which sizes were changed,
   * and values are actual sizes in percents
   */
  onPanelWidthChange?: (newSizes: { [key: string]: number }) => void
  style?: CSSProperties
}

export const resizableContainerStyles = {
  horizontal: css``,
  vertical: css`
    flex-direction: column;
  `,
}

export const StyledResizableContainer = styled.div<ResizableContainerProps>`
  display: flex;
  width: 100%;

  ${({ direction = 'horizontal' }) => resizableContainerStyles[direction]}
`
