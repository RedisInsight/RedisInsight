import React, { ReactNode } from 'react'
import { Section, SectionProps } from '@redis-ui/components'
import cx from 'classnames'

export type RICollapsibleNavGroupProps = Omit<
  SectionProps,
  'collapsible' | 'content' | 'label' | 'defaultOpen'
> & {
  title: string
  children: ReactNode
  isCollapsible?: boolean
  className?: string
  initialIsOpen?: boolean
}
export const RICollapsibleNavGroup = ({
  children,
  title,
  isCollapsible = true,
  className,
  initialIsOpen,
  ...rest
}: RICollapsibleNavGroupProps) => (
  <Section
    {...rest}
    collapsible={isCollapsible}
    className={cx(className, 'RI-collapsible-nav-group')}
    defaultOpen={initialIsOpen}
    content={<div className="RI-collapsible-nav-group-content">{children}</div>}
    label={title}
  />
)
