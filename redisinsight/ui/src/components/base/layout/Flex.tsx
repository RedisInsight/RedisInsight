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
    flex[`align-${align}`],
    flex[`justify-${justify}`],
    {
      [flex[`gap-${gap}`]]: gap !== 'none',
      [flex.flexCentered]: centered,
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

export const Row = (props: RowProps) => <Flex {...props} dir="row" />
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
