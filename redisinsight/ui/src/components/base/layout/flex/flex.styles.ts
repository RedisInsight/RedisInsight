import React, { HTMLAttributes, PropsWithChildren, ReactNode } from 'react'

import styled, { css } from 'styled-components'
import { theme } from 'uiSrc/components/base/theme'
import { CommonProps } from 'uiSrc/components/base/theme/types'

export const gapSizes = ['none', 'xs', 's', 'm', 'l', 'xl'] as const
export type GapSizeType = (typeof gapSizes)[number]
export const columnCount = [1, 2, 3, 4] as const
export type ColumnCountType = (typeof columnCount)[number]

export type GridProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
  columns?: ColumnCountType
  className?: string
  gap?: GapSizeType
  centered?: boolean
  responsive?: boolean
}
const flexGridStyles = {
  columns: {
    1: css`
      grid-template-columns: repeat(1, max-content);
    `,
    2: css`
      grid-template-columns: repeat(2, max-content);
    `,
    3: css`
      grid-template-columns: repeat(3, max-content);
    `,
    4: css`
      grid-template-columns: repeat(4, max-content);
    `,
  },
  responsive: css`
    @media screen and (max-width: 767px) {
      grid-template-columns: repeat(1, 1fr);
      grid-auto-flow: row;
    }
  `,
  centered: css`
    place-content: center;
  `,
}

export const StyledGrid = styled.div<GridProps>`
  display: grid;
  ${({ columns = 1 }) =>
    columns ? flexGridStyles.columns[columns] : flexGridStyles.columns['1']}
  ${({ gap = 'none' }) => (gap ? flexGroupStyles.gapSizes[gap] : '')}
  ${({ centered = false }) => (centered ? flexGroupStyles.centered : '')}
  ${({ responsive = false }) => (responsive ? flexGridStyles.responsive : '')}
`

export const alignValues = [
  'center',
  'stretch',
  'baseline',
  'start',
  'end',
] as const
export const justifyValues = [
  'center',
  'start',
  'end',
  'between',
  'around',
  'evenly',
] as const
export const dirValues = [
  'row',
  'rowReverse',
  'column',
  'columnReverse',
] as const

const flexGroupStyles = {
  wrap: css`
    flex-wrap: wrap;
  `,
  centered: css`
    justify-content: center;
    align-items: center;
  `,
  gapSizes: {
    none: css``,
    xs: css`
      gap: ${theme.semantic.core.space.xs};
    `,
    s: css`
      gap: ${theme.semantic.core.space.s};
    `,
    m: css`
      gap: ${theme.semantic.core.space.m};
    `,
    l: css`
      gap: ${theme.semantic.core.space.l};
    `,
    xl: css`
      gap: ${theme.semantic.core.space.xl};
    `,
  },
  justify: {
    center: css`
      justify-content: center;
    `,
    start: css`
      justify-content: flex-start;
    `,
    end: css`
      justify-content: flex-end;
    `,
    between: css`
      justify-content: space-between;
    `,
    around: css`
      justify-content: space-around;
    `,
    evenly: css`
      justify-content: space-evenly;
    `,
  },
  align: {
    center: css`
      align-items: center;
    `,
    stretch: css`
      align-items: stretch;
    `,
    baseline: css`
      align-items: baseline;
    `,
    start: css`
      align-items: flex-start;
    `,
    end: css`
      align-items: flex-end;
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
  responsive: css`
    @media screen and (max-width: 767px) {
      flex-wrap: wrap;
    }
  `,
}

export type FlexProps = PropsWithChildren &
  CommonProps &
  React.HTMLAttributes<HTMLDivElement> & {
    gap?: GapSizeType
    align?: (typeof alignValues)[number]
    direction?: (typeof dirValues)[number]
    justify?: (typeof justifyValues)[number]
    centered?: boolean
    responsive?: boolean
    wrap?: boolean
    full?: boolean
  }

export const StyledFlex = styled.div<FlexProps>`
  display: flex;
  align-items: stretch;
  flex-grow: 1;
  ${({ gap = 'none' }) => (gap ? flexGroupStyles.gapSizes[gap] : '')}
  ${({ align = 'stretch' }) => (align ? flexGroupStyles.align[align] : '')}
  ${({ direction = 'row' }) =>
    direction ? flexGroupStyles.direction[direction] : ''}
  ${({ justify = 'start' }) =>
    justify ? flexGroupStyles.justify[justify] : ''}
  ${({ centered = false }) => (centered ? flexGroupStyles.centered : '')}
  ${({ responsive = false }) => (responsive ? flexGroupStyles.responsive : '')}
  ${({ wrap = false }) => (wrap ? flexGroupStyles.wrap : '')}
  ${({ full = false }) => (full ? 'height: 100%;' : '')}
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

export const VALID_GROW_VALUES = [
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

export type FlexItemProps = React.HTMLAttributes<HTMLDivElement> &
  PropsWithChildren &
  CommonProps & {
    grow?: (typeof VALID_GROW_VALUES)[number]
  }

export const StyledFlexItem = styled.div<FlexItemProps>`
  display: flex;
  flex-direction: column;
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
`
