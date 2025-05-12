import { HTMLAttributes, ReactNode } from 'react'
import styled from 'styled-components'
import { CommonProps } from 'uiSrc/components/base/theme/types'

export const SpacerSizes = ['xs', 's', 'm', 'l', 'xl', 'xxl'] as const
export type SpacerSize = (typeof SpacerSizes)[number]
export type SpacerProps = CommonProps &
  HTMLAttributes<HTMLDivElement> & {
    children?: ReactNode
    size?: SpacerSize
  }

export const spacerStyles = {
  xs: 'var(--size-xs)',
  s: 'var(--size-s)',
  m: 'var(--size-m)',
  l: 'var(--size-l)',
  // @see redisinsight/ui/src/styles/base/_base.scss:124
  xl: 'calc(var(--base) * 2.25)',
  xxl: 'var(--size-xxl)',
}

export const StyledSpacer = styled.div<SpacerProps>`
  flex-shrink: 0;
  height: ${({ size = 'l' }) => spacerStyles[size]};
`
