import React from 'react'
import cx from 'classnames'

import flex from './flex.module.scss'

export type GridProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode
  columns?: 1 | 2 | 3 | 4
  className?: string
  gap?: 'none' | 's' | 'm' | 'l' | 'xl'
  centered?: boolean
  responsive?: boolean
}

/**
 * A component that arranges its children in a grid.
 *
 * The component is quite flexible and can be used for a wide range of layouts.
 * The most common use case is to divide a section of a page into a set of columns.
 * The number of columns can be specified with the `columns` prop.
 *
 * The `gap` prop allows you to specify the gap between the columns.
 * The `centered` prop will center the content of the grid, and the `responsive` prop will make the grid
 * responsive to the size of the container.
 *
 * @example
 * <Grid gap="m" columns={2}>
 *   <div>Child 1</div>
 *   <div>Child 2</div>
 *   <div>Child 3</div>
 *   <div>Child 4</div>
 * </Grid>
 */
export const Grid = ({
  children,
  className,
  gap = 'none',
  columns = 1,
  centered = false,
  responsive = false,
}: GridProps) => {
  const cn = cx(
    flex.grid,
    {
      [flex[`gap-${gap}`]]: gap !== 'none',
      [flex[`columns-${columns}`]]: [1, 2, 3, 4].includes(columns),
      [flex.gridCentered]: centered,
      [flex.gridResponsive]: responsive,
    },
    className,
  )
  return <div className={cn}>{children}</div>
}

export type FlexProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode
  className?: string
  gap?: 'none' | 's' | 'm' | 'l' | 'xl'
  align?: 'center' | 'stretch' | 'baseline' | 'start' | 'end'
  dir?: 'row' | 'rowReverse' | 'column' | 'columnReverse'
  justify?: 'center' | 'start' | 'end' | 'between' | 'around' | 'evenly'
  centered?: boolean
  responsive?: boolean
  wrap?: boolean
}
export type RowProps = Omit<FlexProps, 'dir'>

/**
 * A container component that arranges its children in a
 * row or column. Can be used to create a wide
 * range of layouts.
 *
 * @example
 * <Flex gap="m" align="center" justify="between">
 *   <div>Child 1</div>
 *   <div>Child 2</div>
 *   <div>Child 3</div>
 * </Flex>
 */
export const Flex = ({
  children,
  className,
  gap = 'none',
  centered = false,
  wrap = false,
  responsive = false,
  align = 'stretch',
  dir = 'row',
  justify = 'start',
  ...rest
}: FlexProps) => {
  const cn = cx(
    flex.flex,
    flex[`flex-${dir}`],
    {
      [flex[`align-${align}`]]: !centered,
      [flex[`justify-${justify}`]]: !centered,
      [flex[`gap-${gap}`]]: gap !== 'none',
      [flex['flex-centered']]: centered,
      [flex.flexResponsive]: responsive,
      [flex.flexWrap]: wrap ? flex.flexWrap : undefined,
    },
    className,
  )
  return (
    <div {...rest} className={cn}>
      {children}
    </div>
  )
}

/**
 * A convenience wrapper around `Flex` that sets `dir` to `"row"`.
 * @see Flex
 */
export const Row = (props: RowProps) => <Flex {...props} dir="row" />

/**
 * A convenience wrapper around `Flex` that sets `dir` to `"column"`.
 * @see Flex
 */
export const Col = (props: RowProps) => <Flex {...props} dir="column" />

const VALID_GROW_VALUES = [
  null,
  undefined,
  true,
  false,
  0,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
] as const
export type FlexItemProps = React.HTMLAttributes<HTMLDivElement> & {
  grow?: boolean | 0 | 5 | 2 | 8 | 3 | 7 | 1 | 4 | 6 | 9 | 10 | null
  inline?: boolean
}

/**
 * FlexItem is a component that wraps its children in a flex container.
 * It can take a boolean or a number as its `grow` prop, which determines how
 * the element should grow in the container.
 *
 * If `grow` is a boolean, it will be treated as a shorthand for `flex-grow: 1`
 * or `flex-grow: 0` depending on the value of `grow`. If `grow` is a number,
 * it will be used as the value of `flex-grow`.
 *
 * The `inline` prop will determine whether the component should render a `span`
 * or a `div`. If `inline` is true, it will render a `span`, otherwise it will
 * render a `div`.
 *
 */
export const FlexItem = ({
  grow = false,
  className,
  inline = false,
  ...props
}: FlexItemProps) => {
  if (!VALID_GROW_VALUES.includes(grow)) {
    throw new Error(`Invalid grow value: ${grow}`)
  }

  const cn = cx(
    flex.flexItem,
    {
      [flex['flexItem-grow']]: !!grow,
      [flex[`flexItem-grow-${typeof grow === 'number' ? grow : 1}`]]: !!grow,
      [flex[`flexItem-grow-0`]]: !grow,
    },
    className,
  )
  if (inline) {
    return <span className={cn} {...props} />
  }
  return <div className={cn} {...props} />
}
