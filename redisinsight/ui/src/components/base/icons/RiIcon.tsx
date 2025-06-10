import React from 'react'
import { Icon, IconProps } from './Icon'
import * as Icons from './index'

export type IconComponentProps = Omit<IconProps, 'icon'> & {
  type: keyof typeof Icons
}

export const RiIcon = ({ type, ...props }: IconComponentProps) => {
  const IconType = Icons[type]

  if (!IconType) {
    console.warn(`Icon type "${type}" not found`)
    return null
  }

  return <Icon icon={IconType} {...props} />
}
