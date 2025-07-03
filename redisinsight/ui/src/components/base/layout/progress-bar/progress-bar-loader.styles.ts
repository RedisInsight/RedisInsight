import { theme } from '@redis-ui/styles'
import styled, { css, keyframes } from 'styled-components'

export const LoaderContainer = styled.div<
  React.HtmlHTMLAttributes<HTMLDivElement>
>`
  position: relative;
  height: 3px;
  background-color: #e6e6e6;
  overflow: hidden;
  border-radius: 2px;
`

const backgroundStyles = {
  loaderBar: {
    primary: css`
      background-color: ${theme.semantic.color.background.primary500};
    `,
  },
}

type LoaderBarColor = keyof typeof backgroundStyles.loaderBar

export type LoaderBarProps = React.HTMLAttributes<HTMLDivElement> & {
  color: LoaderBarColor
}

const loading = keyframes`
  0% {
    transform: scaleX(1) translateX(-100%);
  }
  100% {
    transform: scaleX(1) translateX(100%);
  }
`

export const LoaderBar = styled.div<LoaderBarProps>`
  position: absolute;
  height: 100%;
  width: 100%;
  border-radius: 2px;

  ${({ color = 'primary' }) => backgroundStyles.loaderBar[color]};
  animation: ${loading} 1s ease-in-out infinite;
`
