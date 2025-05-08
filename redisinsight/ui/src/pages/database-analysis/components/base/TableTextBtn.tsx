import styled, { css } from 'styled-components'
import React from 'react'
import { EmptyButton } from 'uiSrc/components/base/forms/buttons'

const expandedStyle = css`
  padding: 0 20px 0 12px;
  color: var(--euiTextSubduedColor) !important;

  &:hover,
  &:focus {
    color: var(--euiTextSubduedColorHover) !important;
  }
`
/**
 * Text button component in top namespaces table
 *
 * This is how we can implement custom styles
 */
export const TableTextBtn = styled(EmptyButton)<
  React.ComponentProps<typeof EmptyButton> & {
    $expanded?: boolean
  }
>`
  width: max-content;

  &:hover,
  &:focus {
    background-color: transparent !important;
    text-decoration: underline;
    color: var(--euiTextSubduedColorHover);
  }
  padding: 0;
  font:
    normal normal normal 13px/17px Graphik,
    sans-serif;
  color: var(--buttonSecondaryTextColor) !important;
  ${({ $expanded }) => {
    if (!$expanded) {
      return ''
    }
    return expandedStyle
  }}
`
