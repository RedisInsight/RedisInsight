import { ButtonHTMLAttributes } from 'react'

export type ResizableButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /**
   * Defaults to displaying a resizer for vertical (y-axis) resizing.
   * Set to `true` to display a resizer for horizontal (x-axis) resizing.
   */
  isHorizontal?: boolean
  /**
   * By default, EuiResizableButton will show a grab handle to indicate resizability.
   * This indicator can be optionally hidden to show a plain border instead.
   */
  indicator?: 'handle' | 'border'
  /**
   * Allows customizing the alignment of grab `handle` indicators (does nothing for
   * border indicators). Defaults to `center`, but consider using `start` for extremely
   * tall content that scrolls off-screen
   */
  alignIndicator?: 'center' | 'start' | 'end'
  /**
   * By default, EuiResizableButton will overlap into the panels before/after it.
   * This can occasionally occlude interactive elements like scrollbars. To prevent
   * this overlap, use this prop to remove the overlap for the specified side.
   */
  accountForScrollbars?: 'before' | 'after' | 'both'
  /**
   * When disabled, the resizer button will be completely hidden
   */
  disabled?: boolean
}
