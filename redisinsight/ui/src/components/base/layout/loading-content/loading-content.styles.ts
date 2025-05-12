import { HTMLAttributes } from 'react'
import styled, { keyframes } from 'styled-components'

export type LineRange = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

export interface LoadingContentProps extends HTMLAttributes<HTMLDivElement> {
  lines?: LineRange
}

const loadingAnimation = keyframes`
  0% {
    transform: translateX(-53%);
  }

  100% {
    transform: translateX(0);
  }
`

export const StyledLoadingContent = styled.span<
  React.HtmlHTMLAttributes<HTMLSpanElement>
>`
  display: block;
  width: 100%;
`

export const SingleLine = styled.span<
  React.HtmlHTMLAttributes<HTMLSpanElement>
>`
  display: block;
  width: 100%;
  height: var(--base);
  margin-bottom: var(--size-s);
  border-radius: var(--size-xs);
  overflow: hidden;

  &:last-child:not(:only-child) {
    width: 75%;
  }
`

export const SingleLineBackground = styled.span`
  display: block;
  width: 220%;
  height: 100%;
  background: linear-gradient(
    137deg,
    var(--loadingContentColor) 45%,
    var(--loadingContentLightestShade) 50%,
    var(--loadingContentColor) 55%
  );
  animation: ${loadingAnimation} 1.5s ease-in-out infinite;
`
