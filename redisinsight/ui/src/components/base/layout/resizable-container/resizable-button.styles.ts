import styled, { css } from 'styled-components'

const sizeBase = 'var(--size-base)'
const sizeM = 'var(--size-base)'

const resizableButtonStyles = {}

export const StyledResizableButton = styled.button<{
  isHorizontal?: boolean
  isDisabled?: boolean
}>`
  position: relative;
  flex-shrink: 0;
  z-index: 1000;

  &::before,
  &::after {
    content: '';
    display: block;
    position: absolute;
    top: 50%;
    left: 50%;
    background-color: ${({ theme }) => theme.eui.euiColorDarkestShade};
    transition:
      width ${({ theme }) => theme.eui.euiResizableButtonTransitionSpeed} ease,
      height ${({ theme }) => theme.eui.euiResizableButtonTransitionSpeed} ease,
      transform ${({ theme }) => theme.eui.euiResizableButtonTransitionSpeed}
        ease,
      background-color
        ${({ theme }) => theme.eui.euiResizableButtonTransitionSpeed} ease;
  }

  ${({ isHorizontal, theme }) =>
    isHorizontal
      ? css`
          cursor: col-resize;
          width: ${theme.eui.euiResizableButtonSize};
          margin-left: calc(-1 * ${theme.eui.euiResizableButtonSize} / 2);
          margin-right: calc(-1 * ${theme.eui.euiResizableButtonSize} / 2);

          &::before,
          &::after {
            width: 1px;
            height: ${theme.eui.euiSizeM};
          }

          &::before {
            transform: translate(-2px, -50%);
          }

          &::after {
            transform: translate(1px, -50%);
          }
        `
      : css`
          cursor: row-resize;
          height: sizeBase;
          margin-top: calc(-1 * sizeBase / 2);
          margin-bottom: calc(-1 * sizeBase / 2);

          &::before,
          &::after {
            width: sizeBase;
            height: 1px;
          }

          &::before {
            transform: translate(-50%, -2px);
          }

          &::after {
            transform: translate(-50%, 1px);
          }
        `}

  &:hover:not(:disabled),
  &:focus:not(:disabled) {
    &::before,
    &::after {
      background-color: ${({ theme }) => theme.eui.euiColorMediumShade};
      transition-delay: ${({ theme }) =>
        theme.eui.euiResizableButtonTransitionSpeed};
    }
  }

  &:focus:not(:disabled) {
    background-color: ${({ theme }) =>
      theme.transparentize(theme.eui.euiColorPrimary, 0.9)};

    &::before,
    &::after {
      background-color: ${({ theme }) => theme.eui.euiColorPrimary};
      transition:
        width var(--anim-speed-fast) ease,
        height var(--anim-speed-fast) text-emphasis-style,
        transform var(--anim-speed-fast) ease;
      transition-delay: calc(var(--anim-speed-fast) / 2);
    }
  }

  &:hover:not(:disabled),
  &:focus:not(:disabled) {
    ${({ isHorizontal }) =>
      isHorizontal
        ? css`
            &::before,
            &::after {
              height: 100%;
            }

            &::before {
              transform: translate(-1px, -50%);
            }

            &::after {
              transform: translate(0, -50%);
            }
          `
        : css`
            &::before,
            &::after {
              width: 100%;
            }

            &::before {
              transform: translate(-50%, -1px);
            }

            &::after {
              transform: translate(-50%, 0);
            }
          `}
  }

  &:disabled {
    display: none !important;
  }
`
