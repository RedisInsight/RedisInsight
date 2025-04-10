import React from 'react'
import cx from 'classnames'
import spacerStyles from './spacer.module.scss'

export const SpacerSizes = ['s', 'm', 'xs', 'l', 'xl', 'xxl'] as const
export type SpacerSize = (typeof SpacerSizes)[number]
export type SpacerProps = React.HTMLAttributes<HTMLDivElement> & {
  children?: React.ReactNode
  size?: SpacerSize
  className?: string
}

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
export const Spacer = ({
  children,
  className,
  size = 'l',
  ...props
}: SpacerProps) => {
  const cn = cx(spacerStyles.spacer, spacerStyles[`spacer-${size}`], className)
  return (
    <div className={cn} {...props}>
      {children}
    </div>
  )
}
