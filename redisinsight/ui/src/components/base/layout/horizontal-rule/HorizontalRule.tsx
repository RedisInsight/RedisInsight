import classNames from 'classnames'

import { HorizontalRuleProps } from './horizontal-rule.styles'

export const HorizontalRule = ({
  className,
  size = 'full',
  margin = 'l',
  ...rest
}: HorizontalRuleProps) => {
  const classes = classNames('RI-horizontal-rule', className)

  const cssStyles = [styles.euiHorizontalRule, styles[size], styles[margin]]

  return <hr css={cssStyles} className={classes} {...rest} />
}
