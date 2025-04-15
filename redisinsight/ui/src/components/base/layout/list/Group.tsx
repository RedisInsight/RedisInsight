import React, { CSSProperties, HTMLAttributes } from 'react'
import classNames from 'classnames'
import styles from './list.module.scss'

export const GAP_SIZES = ['none', 's', 'm'] as const
export type ListGroupGapSize = (typeof GAP_SIZES)[number]

export type ListGroupProps = HTMLAttributes<HTMLUListElement> & {
  className?: string
  'aria-label'?: string
  /**
   * Remove container padding, stretching list items to the edges
   * @default false
   */
  flush?: boolean

  /**
   * Spacing between list items
   * @default s
   */
  gap?: ListGroupGapSize

  /**
   * Sets the max-width of the page.
   * Set to `true` to use the default size,
   * set to `false` to not restrict the width,
   * or set to a number/string for a custom CSS width/measurement.
   *
   * @default true
   */
  maxWidth?: boolean | CSSProperties['maxWidth']
}

const Group = ({
  children,
  className,
  style,
  flush = false,
  gap = 's',
  maxWidth = true,
  color,
  ...rest
}: ListGroupProps) => {
  let newStyle = style

  if (maxWidth && maxWidth !== true) {
    newStyle = { ...newStyle, maxWidth }
  }

  const classes = classNames(
    'ListGroup',
    styles.ListGroup,
    {
      [styles[`ListGroup-gap-${gap}`]]: gap,
      [styles[`ListGroup-flush`]]: flush,
    },
    className,
  )
  return (
    <ul {...rest} className={classes} style={newStyle}>
      {children}
    </ul>
  )
}

export default Group
