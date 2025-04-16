import React from 'react'
import classNames from 'classnames'
import {
  ListClassNames,
  ListGroupProps,
  StyledGroup,
} from 'uiSrc/components/base/layout/list/list.styles'

const Group = ({
  children,
  className,
  style,
  maxWidth = true,
  color,
  ...rest
}: ListGroupProps) => {
  let newStyle = style

  if (maxWidth && maxWidth !== true) {
    newStyle = { ...newStyle, maxWidth }
  }

  const classes = classNames(ListClassNames.listGroup, className)
  return (
    <StyledGroup {...rest} className={classes} style={newStyle}>
      {children}
    </StyledGroup>
  )
}

export default Group
