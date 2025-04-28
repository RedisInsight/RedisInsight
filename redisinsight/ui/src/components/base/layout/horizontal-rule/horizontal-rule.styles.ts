import { HTMLAttributes } from 'react'
import styled, { css } from 'styled-components'

export const SIZES = ['full', 'half', 'quarter'] as const
export const MARGINS = ['none', 'xs', 's', 'm', 'l', 'xl', 'xxl'] as const

export type HorizontalRuleSize = (typeof SIZES)[number]
export type HorizontalRuleMargin = (typeof MARGINS)[number]

const horizontalRuleStyles = {
  size: {
    full: css`
      width: 100%;
    `,
    half: css`
      width: 50%;
      margin-horizontal: auto;
    `,
    quarter: css`
      width: 25%;
      margin-horizontal: auto;
    `,
  },
  margin: {
    none: '',
    xs: css`
      margin-block: var(--size-xs);
    `,
    s: css`
      margin-block: var(--size-s);
    `,
    m: css`
      margin-block: var(--size-m);
    `,
    l: css`
      margin-block: var(--size-l);
    `,
    xl: css`
      margin-block: var(--size-xl);
    `,
    xxl: css`
      margin-block: var(--size-xxl);
    `,
  },
}

export interface HorizontalRuleProps extends HTMLAttributes<HTMLHRElement> {
  size?: HorizontalRuleSize
  margin?: HorizontalRuleMargin
}

export const StyledHorizontalRule = styled.hr<
  Omit<HorizontalRuleProps, 'size' | 'margin'> & {
    size?: HorizontalRuleSize
    margin?: HorizontalRuleMargin
  }
>`
  ${({ size = 'full' }) => horizontalRuleStyles.size[size]}
  ${({ margin = 'l' }) => horizontalRuleStyles.margin[margin]}

  /* Reset the default styles */
  border: none;

  /* If the component is inside a flex box */
  flex-shrink: 0;
  flex-grow: 0;

  background-color: var(--hrBackgroundColor);
  height: 1px;
`
