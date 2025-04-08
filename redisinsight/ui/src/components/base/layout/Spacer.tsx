import React from 'react'
import cx from 'classnames'
import spacerStyles from './spacer.module.scss'

export const SpacerSize = ['s', 'm', 'xs', 'l', 'xl', 'xxl'] as const
export type SpacerProps = {
  children?: React.ReactNode
  size?: (typeof SpacerSize)[number]
  className?: string
}

export const Spacer = ({ children, className, size = 'l' }: SpacerProps) => {
  const cn = cx(spacerStyles.spacer, spacerStyles[`spacer-${size}`], className)
  return <div className={cn}>{children}</div>
}
