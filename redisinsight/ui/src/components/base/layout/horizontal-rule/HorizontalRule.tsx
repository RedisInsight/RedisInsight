import classNames from 'classnames'
import React from 'react'

import {
  HorizontalRuleProps,
  StyledHorizontalRule,
} from './horizontal-rule.styles'

export const HorizontalRule = ({
  className,
  size = 'full',
  margin = 'l',
  ...rest
}: HorizontalRuleProps) => {
  const classes = classNames('RI-horizontal-rule', className)

  return (
    <StyledHorizontalRule
      size={size}
      margin={margin}
      className={classes}
      {...rest}
    />
  )
}
