import { theme } from '@redis-ui/styles'
import { ReactNode } from 'react'
import styled, { css, keyframes } from 'styled-components'

const backgroundStyles = {
  loaderBar: {
    primary: css`
      background-color: ${theme.semantic.color.background.primary500};
    `,
  },
}

const loading = keyframes`
  0% {
    transform: scaleX(1) translateX(-100%);
  }
  100% {
    transform: scaleX(1) translateX(100%);
  }
`

interface LoaderContainerProps {
  children?: ReactNode
  style?: React.CSSProperties
  className?: string
}

export const LoaderContainer = styled.div<LoaderContainerProps>`
  position: relative;
  height: 3px;
  background-color: #e6e6e6;
  overflow: hidden;
  border-radius: 2px;
`

type LoaderBarColor = keyof typeof backgroundStyles.loaderBar

interface LoaderBarProps {
  color: LoaderBarColor
}

export const LoaderBar = styled.div<LoaderBarProps>`
  position: absolute;
  height: 100%;
  width: 100%;
  border-radius: 2px;

  ${({ color = 'primary' }) => backgroundStyles.loaderBar[color]};
  animation: ${loading} 1s ease-in-out infinite;
`

export type ProgressBarLoaderProps = LoaderContainerProps & LoaderBarProps
