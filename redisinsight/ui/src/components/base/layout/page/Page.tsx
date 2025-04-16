import React from 'react'
import cx from 'classnames'
import {
  PageClassNames,
  PageContentBodyProps,
  PageProps,
  restrictWidthSize,
  StyledPage,
  StyledPageContentBody,
} from 'uiSrc/components/base/layout/page/page.styles'

const Page = ({
  className,
  restrictWidth = false,
  paddingSize = 'm',
  grow = true,
  direction = 'row',
  style,
  ...rest
}: PageProps) => (
  <StyledPage
    {...rest}
    className={cx(PageClassNames.page, className)}
    $grow={grow}
    $direction={direction}
    $restrictWidth={restrictWidth}
    $paddingSize={paddingSize}
    style={restrictWidthSize(style, restrictWidth)}
  />
)

export default Page

export const PageContentBody = ({
  restrictWidth = false,
  paddingSize = 'none',
  style,
  className,
  ...rest
}: PageContentBodyProps) => {
  const classes = cx(PageClassNames.contentBody, className)

  return (
    <StyledPageContentBody
      className={classes}
      $paddingSize={paddingSize}
      $restrictWidth={restrictWidth}
      style={restrictWidthSize(style, restrictWidth)}
      {...rest}
    />
  )
}
