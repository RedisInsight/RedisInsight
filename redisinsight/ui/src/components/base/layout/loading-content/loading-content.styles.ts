import { HTMLAttributes } from 'react'
import styled, { keyframes } from 'styled-components'

export type LineRange = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

export interface LoadingContentProps extends HTMLAttributes<HTMLDivElement> {
  lines?: LineRange
}

const euiSize = '16px' // Replace with your actual EUI sizing token
const euiSizeS = '8px'
const euiBorderRadius = '4px'
const euiGradientStartStop = '#f5f7fa'
const euiGradientMiddle = '#e5e9f0'
const euiAnimSlightResistance = 'ease-in-out'

const loadingAnimation = keyframes`
  0% {
    transform: translateX(-53%);
  }

  100% {
    transform: translateX(0);
  }
`

export const StyledLoadingContent = styled.span.attrs(() => ({}))<
  React.HtmlHTMLAttributes<HTMLSpanElement>
>`
  display: block;
  width: 100%;
`

export const SingleLine = styled.span.attrs(() => ({}))<
  React.HtmlHTMLAttributes<HTMLSpanElement>
>`
  display: block;
  width: 100%;
  height: ${euiSize};
  margin-bottom: ${euiSizeS};
  border-radius: ${euiBorderRadius};
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
    ${euiGradientStartStop} 45%,
    ${euiGradientMiddle} 50%,
    ${euiGradientStartStop} 55%
  );

  animation: ${loadingAnimation} 1.5s ${euiAnimSlightResistance} infinite;
`
