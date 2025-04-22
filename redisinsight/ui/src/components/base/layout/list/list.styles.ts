import styled, { css } from 'styled-components'
import {
  CSSProperties,
  HTMLAttributes,
  MouseEventHandler,
  ReactElement,
  ReactNode,
  Ref,
  ButtonHTMLAttributes,
  AllHTMLAttributes,
} from 'react'
// todo replace with redis-ui icon
import { EuiIconProps, IconType } from '@elastic/eui/src/components/icon/icon'

export const ListClassNames = {
  listItem: 'RI-list-group-item',
  listItemLabel: 'RI-list-group-item-label',
  listItemButton: 'RI-list-group-item-button',
  listItemText: 'RI-list-group-item-text',
  listGroup: 'RI-list-group',
  listItemActive: 'isActive',
  listItemDisabled: 'isDisabled',
}

export const GAP_SIZES = ['none', 's', 'm'] as const
export type ListGroupGapSize = (typeof GAP_SIZES)[number]

export type ListGroupProps = HTMLAttributes<HTMLUListElement> & {
  className?: string
  /**
   * Remove container padding, stretching list items to the edges
   * @default false
   */
  flush?: boolean

  /**
   * Spacing between list items
   * @default s
   */
  gap?: ListGroupGapSize

  /**
   * Sets the max-width of the page.
   * Set to `true` to use the default size,
   * set to `false` to not restrict the width,
   * or set to a number/string for a custom CSS width/measurement.
   *
   * @default true
   */
  maxWidth?: boolean | CSSProperties['maxWidth']
}

export const listStyles = {
  gap: {
    none: css`
      gap: 0;
    `,
    s: css`
      gap: var(--gap-s);
    `,
    m: css`
      gap: var(--gap-m);
    `,
  },
  flush: css`
    margin: 0;
    padding: 0;
    border: 0 none;

    .${ListClassNames.listItem} {
      border-radius: 0;
    }
  `,
}

export const StyledGroup = styled.ul<
  Omit<ListGroupProps, 'gap' | 'flush' | 'maxWidth'> & {
    $gap?: ListGroupGapSize
    $flush?: boolean
  }
>`
  display: flex;
  flex-direction: column;
  ${({ $gap = 's' }) => listStyles.gap[$gap]};
  ${({ $flush = false }) => $flush && listStyles.flush};
`

type IconProps = Omit<EuiIconProps, 'type'>
export const SIZES = ['xs', 's', 'm', 'l'] as const
export type ListGroupItemSize = (typeof SIZES)[number]

export const COLORS = ['primary', 'text', 'subdued', 'ghost'] as const
export type ListGroupItemColor = (typeof COLORS)[number]

export type ListGroupItemProps = HTMLAttributes<HTMLLIElement> & {
  /**
   * Size of the label text
   */
  size?: ListGroupItemSize
  /**
   * By default, the item will get the color `text`.
   * You can customize the color of the item by passing a color name.
   */
  color?: ListGroupItemColor

  /**
   * Content to be displayed in the list item
   */
  label: ReactNode

  /**
   * Apply styles indicating an item is active
   */
  isActive?: boolean

  /**
   * Apply styles indicating an item is disabled
   */
  isDisabled?: boolean

  /**
   * Adds `EuiIcon` of `EuiIcon.type`
   */
  iconType?: IconType

  /**
   * Further extend the props applied to EuiIcon
   */
  iconProps?: Omit<IconProps, 'type'>

  /**
   * Custom node to pass as the icon. Cannot be used in conjunction
   * with `iconType` and `iconProps`.
   */
  icon?: ReactElement

  /**
   * Make the list item label a button.
   * While permitted, `href` and `onClick` should not be used together in most cases and may create problems.
   */
  onClick?: MouseEventHandler<HTMLButtonElement>

  /**
   * Allow link text to wrap
   */
  wrapText?: boolean

  /**
   * Pass-through ref reference specifically for targeting
   * instances where the item content is rendered as a `button`
   */
  buttonRef?: Ref<HTMLButtonElement>
}

const listItemStyles = {
  size: {
    xs: css`
      border-radius: var(--border-radius-small);
    `,
    s: css`
      border-radius: var(--border-radius-small);
    `,
    m: css`
      border-radius: var(--border-radius-medium);
    `,
    l: css`
      border-radius: var(--border-radius-medium);
    `,
  },
  active: {
    primary: css`
      background-color: var(--color-primary);
    `,
    text: css`
      background-color: var(--color-subdued);
    `,
    subdued: css`
      background-color: var(--color-subdued);
    `,
    ghost: css`
      background-color: var(--color-ghost);
    `,
  },
  clickable: {
    primary: css`
      &:hover,
      &:focus-within {
        background-color: var(--color-subdued);
      }
    `,
    text: css`
      &:hover,
      &:focus-within {
        background-color: var(--color-subdued);
      }
    `,
    subdued: css`
      &:hover,
      &:focus-within {
        background-color: var(--color-subdued);
      }
    `,
    ghost: css`
      &:hover,
      &:focus-within {
        background-color: var(--color-ghost);
      }
    `,
  },
}

export const StyledItem = styled.li<
  Omit<
    ListGroupItemProps,
    'label' | 'color' | 'size' | 'isDisabled' | 'isActive'
  > & {
    $size?: ListGroupItemSize
    $color?: ListGroupItemColor
    $isDisabled?: boolean
    $isActive?: boolean
  }
>`
  // todo: take from theme
  --color-primary: #e8f1ff;
  --color-subdued: #e8f1ff;
  --color-ghost: rgba(255, 255, 255, 0.1);
  --color-primary-text: #006bb4;
  --color-ghost-text: #fff;
  --color-text-text: #343741;
  --background-hover: rgba(23 80 186 / 0.04);
  --background-primary-hover: rgba(23 80 186 / 0.04);
  --border-radius-small: 4px;
  --border-radius-medium: 6px;
  --size-xs: 4px;
  --size-s: 6px;
  --size-m: 12px;
  --size-l: 20px;
  --size-xl: 32px;
  --size-xxl: 40px;
  --font-weight-m: 500;
  --font-size-xs: 12px;
  --font-size-s: 14px;
  --font-size-m: 16px;
  --font-size-l: 18px;
  padding: 0;
  display: flex;
  align-items: center;
  position: relative;
  transition: background-color 150ms;
  ${({ $size = 'm' }) => listItemStyles.size[$size]};
  ${({ $isActive = false, $color = 'text' }) =>
    $isActive && listItemStyles.active[$color]};
  ${({ onClick, $color = 'text' }) =>
    onClick !== undefined && listItemStyles.clickable[$color]};
`

const listItemInnerStyles = {
  base: css`
    padding: var(--size-xs) var(--size-s);
    display: flex;
    align-items: center;
    flex-grow: 1;
    max-inline-size: 100%;
    overflow: hidden;
    text-align: start;
    font-weight: inherit;
  `,
  size: {
    xs: css`
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-m);
      letter-spacing: 0;
      min-height: var(--size-l);
    `,
    s: css`
      font-size: var(--font-size-s);
      font-weight: var(--font-weight-m);
      letter-spacing: 0;
      min-height: var(--size-xl);
    `,
    m: css`
      font-size: var(--font-size-m);
      min-height: var(--size-xl);
    `,
    l: css`
      font-size: var(--font-size-l);
      min-height: var(--size-xxl);
    `,
  },
  colors: {
    // Colors
    primary: css`
      color: var(--color-primary-text);
    `,
    text: css`
      color: var(--color-text-text);
    `,
    subdued: css`
      color: var(--euiTextSubduedColor);
    `,
    ghost: css`
      color: var(--color-ghost-text);
    `,
  },
  variants: {
    // Variants
    isDisabled: css`
      cursor: not-allowed;

      &,
      &:hover,
      &:focus {
        color: #ffffff;
        background-color: transparent;
        text-decoration: none;
      }
    `,
    isActive: css``,
    isClickable: css`
      &:hover,
      &:focus {
        text-decoration: underline;
      }
    `,
    externalIcon: css`
      margin-left: var(--size-s);
    `,
  },
}

type InnerProps = {
  $size?: ListGroupItemSize
  $color?: ListGroupItemColor
  $isActive?: boolean
  $isDisabled?: boolean
  $isClickable?: boolean
  ref?: React.Ref<HTMLButtonElement | HTMLSpanElement>
}

export const StyledItemInnerButton = styled.button<
  ButtonHTMLAttributes<HTMLButtonElement> & InnerProps
>`
  ${listItemInnerStyles.base}
  ${({ $size = 'm' }) => listItemInnerStyles.size[$size]}
    ${({ $isActive = false }) =>
    $isActive && listItemInnerStyles.variants.isActive}
    ${({ $isDisabled = false }) =>
    $isDisabled && listItemInnerStyles.variants.isDisabled}
    ${({ $isDisabled = false, $color = 'text' }) =>
    !$isDisabled && listItemInnerStyles.colors[$color]}
    ${({ $isDisabled = false, $isClickable = false }) =>
    !$isDisabled && $isClickable && listItemInnerStyles.variants.isClickable}
`

export const StyledItemInnerSpan = styled.span<
  Omit<AllHTMLAttributes<HTMLSpanElement>, 'size'> & InnerProps
>`
  ${listItemInnerStyles.base}
  ${({ $size = 'm' }) => listItemInnerStyles.size[$size]}
    ${({ $isActive = false }) =>
    $isActive && listItemInnerStyles.variants.isActive}
    ${({ $isDisabled = false }) =>
    $isDisabled && listItemInnerStyles.variants.isDisabled}
    ${({ $isDisabled = false, $color = 'text' }) =>
    !$isDisabled && listItemInnerStyles.colors[$color]}
    ${({ $isDisabled = false, $isClickable = false }) =>
    !$isDisabled && $isClickable && listItemInnerStyles.variants.isClickable}
`

const listItemLabelStyles = {
  truncate: css`
    max-width: 100%;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    white-space: nowrap !important;
  `,
  wrapText: css`
    overflow-wrap: break-word !important; // makes sure the long string will wrap and not bust out of the container
    word-break: break-word;
  `,
}

export const StyledLabel = styled.span<{
  wrapText?: boolean
  children: ReactNode
  className?: string
  title?: string | ReactNode
  ref?: React.Ref<HTMLSpanElement>
}>`
  white-space: break-spaces;
  ${({ wrapText }) =>
    wrapText ? listItemLabelStyles.wrapText : listItemLabelStyles.truncate}
`
