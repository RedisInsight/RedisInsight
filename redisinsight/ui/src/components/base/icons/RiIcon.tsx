import React, { SVGProps } from 'react'
import { Icon, IconProps } from './Icon'
import * as Icons from './index'

// Create a type that excludes the IconProps type
export type AllIconsType = Exclude<
  keyof typeof Icons,
  | 'IconProps'
  | 'Icon'
  | 'IconSizeType'
  | 'IconColorType'
  | 'ColorIconProps'
  | 'MonochromeIconProps'
  | 'IconType'
>

export type IconComponentProps = Omit<IconProps, 'icon' | 'size'> & 
  Omit<SVGProps<SVGSVGElement>, 'color' | 'size'> & {
  type: AllIconsType
  size?: IconProps['size'] | 'm' | 's' | 'xs'
}

export const RiIcon = ({ type, size, ...props }: IconComponentProps) => {
  const IconType = Icons[type]

  if (!IconType) {
    console.warn(`Icon type "${type}" not found`)
    return null
  }
  let iconSize: IconProps['size'] = 'L'
  if (size === 'm') {
    iconSize = 'M'
  } else if (size === 's') {
    iconSize = 'S'
  } else if (size === 'xs') {
    iconSize = 'XS'
  }

  return <Icon icon={IconType} {...props} size={iconSize} />
}
