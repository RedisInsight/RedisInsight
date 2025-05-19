import styled, { css } from 'styled-components'
import { ResizableButtonProps } from './ResizableButton'

export const resizableCollapseButtonStyles = {
  resizableCollapseButton: css`
    z-index: 2; /* 1 higher than EuiResizableButton */
    position: absolute;

    /* Remove animation inherited from EuiButtonIcon */
    &:focus {
      animation: none;
    }
  `,
  collapsible: {
    collapsible: css`
      background: #ffffff; /* empty shade */
      box-shadow:
        0 0.8px 0.8px calc(var(--resizableButtonShadowOpacity) * 0.04),
        0 2.3px 2px calc(var(--resizableButtonShadowOpacity) * 0.03);

      &:focus {
        box-shadow:
          0 1px 5px calc(var(--resizableButtonShadowOpacity) * 0.1),
          0 3.6px 13px calc(var(--resizableButtonShadowOpacity) * 0.07),
          0 8.4px 23px calc(var(--resizableButtonShadowOpacity) * 0.06),
          0 23px 35px calc(var(--resizableButtonShadowOpacity) * 0.05);
      }
    `,
    horizontal: {
      after: css`
        right: 0;
        margin-right: calc(var(--size-l) / -2);
      `,
      before: css`
        left: 0;
        margin-left: calc(var(--size-l) / -2);
      `,
      middle: css`
        top: 50%;
        margin-top: calc(var(--size-l) / -2);
      `,
      top: css`
        top: 0;
        margin-top: var(--size-base);
      `,
      bottom: css`
        bottom: 0;
        margin-bottom: var(--size-base);
      `,
      // `left/right` aren't valid positions for the horizontal direction,
      // so we're using getters to fall back to the `middle` CSS
      get left() {
        return this.middle
      },
      get right() {
        return this.middle
      },
    },
    vertical: {
      after: css`
        top: 100%;
        margin-top: calc(var(--size-l) / -2);
      `,
      before: css`
        bottom: 100%;
        margin-bottom: calc(var(--size-l) / -2);
      `,
      middle: css`
        left: 50%;
        margin-left: calc(var(--size-l) / -2);
      `,
      left: css`
        left: 0;
        margin-left: var(--size-base);
      `,
      right: css`
        right: 0;
        margin-right: var(--size-base);
      `,
      // `top/bottom` aren't valid positions for the horizontal direction,
      // so we're using getters to fall back to the `middle` CSS
      get top() {
        return this.middle
      },
      get bottom() {
        return this.middle
      },
    },
  },
  collapsed: {
    // When collapsed, the button itself is the full collapsed area
    // and we use flex to align the icon within
    collapsed: css`
      border-radius: 0;
      top: 0;
    `,
    horizontal: css`
      height: 100%;
    `,
    vertical: css`
      width: 100%;
    `,
    horizontalPositions: {
      top: css`
        padding-top: var(--size-base);
        align-items: flex-start;
      `,
      bottom: css`
        padding-bottom: var(--size-base);
        align-items: flex-end;
      `,
      middle: css``,
      left: css``,
      right: css``,
    },
    verticalPositions: {
      left: css`
        padding-left: var(--size-base);
        justify-content: flex-start;
      `,
      right: css`
        padding-right: var(--size-base);
        justify-content: flex-end;
      `,
      middle: css``,
      top: css``,
      bottom: css``,
    },
  },
}

export const resizableButtonStyles = {
  // Creates a resizable indicator (either a grab handle or a plain border) with CSS psuedo-elements.
  // 1. The "grab" handle transforms into a thicker straight line on :hover and :focus
  // 2. Start/end aligned grab handles should have a slight margin offset that disappears on hover/focus
  // 3. CSS hack to smooth out/anti-alias the 1px wide handles at various zoom levels
  // 4. High contrast modes should not rely on background-color to indicate focus state, but on border width
  euiResizableButton: css`
    z-index: 1;
    flex-shrink: 0;
    display: flex;
    justify-content: center;

    &:disabled {
      display: none;
    }

    &::before,
    &::after {
      content: '';
      display: block;

      @include global.can-animate {
        transition:
          width var(--anim-speed-fast) ease,
          height var(--anim-speed-fast) ease,
          margin var(--anim-speed-fast) ease,
          background-color var(--anim-speed-fast) ease;
      }
    }

    /* Add a transparent background to the container and color the border primary
       with primary color on :focus (NOTE - :active is needed for Safari) */
    &:focus,
    &:active {
      &::before,
      &::after {
        /* Overrides default transition so that "grab" background-color doesn't animate */
        @include global.can-animate {
          transition:
            width var(--anim-speed-fast) ease,
            height var(--anim-speed-fast) ease;
          transition-delay: var(--anim-speed-fast-delay);
        }
      }
    }
  `,
  horizontal: css`
    cursor: col-resize;
    height: 100%;
    width: var(--size-base);
  `,
  vertical: css`
    flex-direction: column;
    cursor: row-resize;
    width: 100%;
    height: var(--size-base);
  `,
  accountForScrollbars: {
    horizontal: {
      both: css``,
      before: css`
        margin-right: calc(var(--size-base) / - 2);
      `,
      after: css`
        margin-left: calc(var(--size-base) / - 2);
      `,
      none: css`
        margin-inline: calc(var(--size-base) / - 2);
      `,
    },
    vertical: {
      both: css``,
      before: css`
        margin-bottom: calc(var(--size-base) / - 2);
      `,
      after: css`
        margin-top: calc(var(--size-base) / - 2);
      `,
      none: css`
        margin-block: calc(var(--size-base) / - 2);
      `,
    },
  },

  border: css`
    &::before,
    &::after {
      background-color: var(--resizableBorderColor);
    }
  `,
  borderDirection: {
    horizontal: css`
      &::before {
        width: var(--border-thin);
        height: 100%;
      }

      &:hover,
      &:focus,
      &:active {
        &::after {
          width: var(--border-thin);
          height: 100%;
        }
      }
    `,
    vertical: css`
      &::before {
        height: var(--border-thin);
        width: 100%;
      }

      &:hover,
      &:focus,
      &:active {
        &::after {
          height: var(--border-thin);
          width: 100%;
        }
      }
    `,
  },

  handle: css`
    gap: 2px;

    /* 1 */
    &:hover,
    &:focus,
    &:active {
      gap: 0;
    }

    @include global.can-animate {
      transition: gap var(--anim-speed-fast) ease;
    }

    &::before,
    &::after {
      background-color: var(--resizableDarkestShade);
      transform: translateZ(0); /* 3 */
    }

    /* Lighten color on :hover */
    &:hover {
      &::before,
      &::after {
        /* Delay transition on hover so animation is not accidentally triggered on mouse over */
        @include global.can-animate {
          transition-delay: var(--anim-speed-fast);
        }
      }
    }
  `,
  handleDirection: {
    horizontal: css`
      &::before,
      &::after {
        width: var(--border-thin);
        height: var(--size-m);
        margin-block: var(--size-base); /* 2 */
      }

      /* 1 */
      &:hover,
      &:focus,
      &:active {
        &::before,
        &::after {
          height: 100%;
          margin-block: 0; /* 2 */
          transform: none; /* 3 */
        }
      }
    `,
    vertical: css`
      &::before,
      &::after {
        height: var(--border-thin);
        width: var(--size-m);
        margin-inline: var(--size-base); /* 2 */
      }

      /* 1 */
      &:hover,
      &:focus,
      &:active {
        &::before,
        &::after {
          width: 100%;
          margin-inline: 0; /* 2 */
          transform: none; /* 3 */
        }
      }
    `,
  },
  alignIndicator: {
    center: css`
      align-items: center;
    `,
    start: css`
      align-items: flex-start;
    `,
    end: css`
      align-items: flex-end;
    `,
  },
}

export const StyledResizableButton = styled.button<ResizableButtonProps>`
  ${resizableButtonStyles.euiResizableButton}
  ${({ isHorizontal = false }) =>
    isHorizontal
      ? resizableButtonStyles.horizontal
      : resizableButtonStyles.vertical}
`
