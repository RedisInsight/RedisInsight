import React from 'react'
import cx from 'classnames'
import {
  SpacerProps,
  StyledSpacer,
} from 'uiSrc/components/base/layout/spacer/spacer.styles'

/**
 * A simple spacer component that can be used to add vertical spacing between
 * other components. The size of the spacer can be specified using the `size`
 * prop, which can be one of the following values:
 *   - 'xs' = 4px
 *   - 's' = 8px
 *   - 'm' = 12px
 *   - 'l' = 16px
 *   - 'xl' = 24px
 *   - 'xxl' = 32px.
 *
 *   The default value for `size` is 'l'.
 */
export const Spacer = ({ className, children, ...rest }: SpacerProps) => (
  <StyledSpacer {...rest} className={cx('RI-spacer', className)}>
    {children}
  </StyledSpacer>
)
