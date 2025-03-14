import React, { PropsWithChildren } from 'react'

import styled, { css } from 'styled-components'
import { theme } from '@redislabsdev/redis-ui-styles'
import classNames from 'classnames'

const flexGroupStyles = {
  flexGroup: css`
    display: flex;
    align-items: stretch;
    flex-grow: 1; /* Grow nested flex-groups by default */
  `,
  wrap: css`
    flex-wrap: wrap;
  `,
  gutterSizes: {
    none: css``,
    xs: css`
      gap: ${theme.semantic.core.space.space050};
    `,
    s: css`
      gap: ${theme.semantic.core.space.space100};
    `,
    m: css`
      gap: ${theme.semantic.core.space.space150};
    `,
    l: css`
      gap: ${theme.semantic.core.space.space250};
    `,
    xl: css`
      gap: ${theme.semantic.core.space.space500};
    `,
  },
  justifyContent: {
    flexStart: css`
      justify-content: flex-start;
    `,
    flexEnd: css`
      justify-content: flex-end;
    `,
    spaceEvenly: css`
      justify-content: space-evenly;
    `,
    spaceBetween: css`
      justify-content: space-between;
    `,
    spaceAround: css`
      justify-content: space-around;
    `,
    center: css`
      justify-content: center;
    `,
  },
  alignItems: {
    stretch: css`
      align-items: stretch;
    `,
    flexStart: css`
      align-items: flex-start;
    `,
    flexEnd: css`
      align-items: flex-end;
    `,
    center: css`
      align-items: center;
    `,
    baseline: css`
      align-items: baseline;
    `,
  },
  direction: {
    row: css`
      flex-direction: row;
    `,
    rowReverse: css`
      flex-direction: row-reverse;
    `,
    column: css`
      flex-direction: column;
    `,
    columnReverse: css`
      flex-direction: column-reverse;
    `,
  },
}

export const GUTTER_SIZES = ['none', 'xs', 's', 'm', 'l', 'xl'] as const
export type EuiFlexGroupGutterSize = (typeof GUTTER_SIZES)[number]

export const ALIGN_ITEMS = [
  'stretch',
  'flexStart',
  'flexEnd',
  'center',
  'baseline',
] as const
export type FlexGroupAlignItems = (typeof ALIGN_ITEMS)[number]

export const JUSTIFY_CONTENTS = [
  'flexStart',
  'flexEnd',
  'center',
  'spaceBetween',
  'spaceAround',
  'spaceEvenly',
] as const
type FlexGroupJustifyContent = (typeof JUSTIFY_CONTENTS)[number]

export const DIRECTIONS = [
  'row',
  'rowReverse',
  'column',
  'columnReverse',
] as const
type FlexGroupDirection = (typeof DIRECTIONS)[number]

export interface CommonProps {
  className?: string
}

export type FlexGroupProps = PropsWithChildren &
  CommonProps & {
    alignItems?: FlexGroupAlignItems
    direction?: FlexGroupDirection
    gutterSize?: EuiFlexGroupGutterSize
    justifyContent?: FlexGroupJustifyContent
    wrap?: boolean
    full?: boolean
  }

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

export type FlexItemProps = PropsWithChildren &
  CommonProps & {
    grow?: (typeof VALID_GROW_VALUES)[number] // Leave this as an inline string enum so the props table properly parses it
  }
const StyledFlexGroup = styled.div<FlexGroupProps>`
  ${() => flexGroupStyles.flexGroup}
  ${(props) => (props.full ? 'height: 100%;' : '')}
  ${(props) => (props.wrap ? flexGroupStyles.wrap : '')}
  ${(props) =>
    props.gutterSize ? flexGroupStyles.gutterSizes[props.gutterSize] : ''}
  ${(props) =>
    props.justifyContent
      ? flexGroupStyles.justifyContent[props.justifyContent]
      : ''}
  ${(props) =>
    props.alignItems ? flexGroupStyles.alignItems[props.alignItems] : ''}
  ${(props) =>
    props.direction ? flexGroupStyles.direction[props.direction] : ''}
`
export const flexItemStyles = {
  growZero: css`
    flex-grow: 0;
    flex-basis: auto;
  `,
  grow: css`
    flex-basis: 0;
  `,
  growSizes: {
    '1': css`
      flex-grow: 1;
    `,
    '2': css`
      flex-grow: 2;
    `,
    '3': css`
      flex-grow: 3;
    `,
    '4': css`
      flex-grow: 4;
    `,
    '5': css`
      flex-grow: 5;
    `,
    '6': css`
      flex-grow: 6;
    `,
    '7': css`
      flex-grow: 7;
    `,
    '8': css`
      flex-grow: 8;
    `,
    '9': css`
      flex-grow: 9;
    `,
    '10': css`
      flex-grow: 10;
    `,
  },
}

/**
 * Flex Group Component
 *
 * A flexbox container that can be used to lay out other flex items.
 * All properties are passed directly to the underlying `div`.
 *
 * @remarks
 * This is more or less direct reimplementation of `EuiFlexGroup`
 *
 * @example
 * <FlexGroup>
 *   <FlexItem grow={2}>
 *     Left
 *   </FlexItem>
 *   <FlexItem grow={3}>
 *     Right
 *   </FlexItem>
 * </FlexGroup>
 */
export const FlexGroup = ({ children, className, ...rest }: FlexGroupProps) => {
  const classes = classNames('RI-flex-group', className)
  return (
    <StyledFlexGroup {...rest} className={classes}>
      {children}
    </StyledFlexGroup>
  )
}

/**
 * Column Component
 *
 * A Column component is a special type of FlexGroup that is meant to be used when you
 * want to layout out a group of items in a vertical column. It is functionally equivalent to
 * using a FlexGroup with a direction of 'column', but includes some additional conveniences.
 *
 * This is the preferred API of a component, that is not meant to be distributed, but widely used in our project
 *
 * @example
 * <Column>
 *   <FlexItem grow={2}>
 *     Top
 *   </FlexItem>
 *   <FlexItem grow={3}>
 *     Bottom
 *   </FlexItem>
 * </Column>
 */
export const Column = ({
  className,
  reverse,
  contentCentered,
  alignItems,
  justifyContent,
  ...rest
}: FlexGroupProps & {
  reverse?: boolean
  contentCentered?: boolean
}) => {
  const classes = classNames('RI-column-group', className)
  return (
    <FlexGroup
      {...rest}
      alignItems={contentCentered ? 'center' : alignItems}
      justifyContent={contentCentered ? 'center' : justifyContent}
      className={classes}
      direction={reverse ? 'columnReverse' : 'column'}
    />
  )
}

export const Row = ({
  className,
  reverse,
  ...rest
}: FlexGroupProps & { reverse?: boolean }) => {
  const classes = classNames('RI-row-group', className)
  return (
    <FlexGroup
      {...rest}
      className={classes}
      direction={reverse ? 'rowReverse' : 'row'}
    />
  )
}

const StyledFlexItem = styled.div<FlexItemProps>`
  ${(props) => {
    const { grow } = props
    if (!grow) {
      return flexItemStyles.growZero
    }
    const result = [flexItemStyles.grow]
    if (typeof grow === 'number') {
      result.push(flexItemStyles.growSizes[grow])
    } else {
      result.push(flexItemStyles.growSizes['1'])
    }
    return result.join('\n')
  }}
  display: flex;
  flex-direction: column;
`

/**
 * Flex item component
 *
 * This represents more or less direct implementation of `EuiFlexItem`
 *
 * @remarks
 * This component is useful when you want to create a flex item that can
 * grow or shrink based on the available space.
 *
 * @example
 * <FlexItem grow={2}>
 *   <div>Content</div>
 * </FlexItem>
 */
export const FlexItem = ({ children, className, ...rest }: FlexItemProps) => {
  const classes = classNames('RI-flex-item', className)
  return (
    <StyledFlexItem {...rest} className={classes}>
      {children}
    </StyledFlexItem>
  )
}

/**
 * A wrapper around `FlexItem` that sets `grow` to `false`.
 * Use this when you want a `FlexItem` that doesn't grow.
 *
 * @example
 * <FixedItem>My fixed item</FixedItem>
 */
export const FixedItem = (props: FlexItemProps) => (
  <FlexItem {...props} grow={false} />
)

/**
 * A wrapper around `FlexItem` that sets `grow` to `true`.
 * Use this when you want a `FlexItem` that grows to fill the available space.
 *
 * @example
 * <GrowItem>My growing item</GrowItem>
 */
export const GrowItem = (props: FlexItemProps) => <FlexItem {...props} grow />
