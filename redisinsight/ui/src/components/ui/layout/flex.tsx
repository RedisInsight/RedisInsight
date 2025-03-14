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

export const FlexGroup = ({ children, className, ...rest }: FlexGroupProps) => {
  const classes = classNames('RI-flex-group', className)
  return (
    <StyledFlexGroup {...rest} className={classes}>
      {children}
    </StyledFlexGroup>
  )
}
export const ColumnGroup = ({ className, ...rest }: FlexGroupProps) => {
  const classes = classNames('RI-column-group', className)
  return <FlexGroup {...rest} className={classes} direction="column" />
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

export const FlexItem = ({ children, className, ...rest }: FlexItemProps) => {
  const classes = classNames('RI-flex-item', className)
  return (
    <StyledFlexItem {...rest} className={classes}>
      {children}
    </StyledFlexItem>
  )
}

export const FixedItem = (props: FlexItemProps) => {
  return <FlexItem {...props} grow={false} />
}
