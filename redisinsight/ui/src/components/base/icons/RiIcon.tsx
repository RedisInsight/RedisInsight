import React, { SVGProps } from 'react'
import { IconProps } from './Icon'
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
    size?: IconProps['size'] | 'm' | 's' | 'xs' | 'l' | 'xl' | 'xxl'
  }

export const RiIcon = ({ type, size, ...props }: IconComponentProps) => {
  const IconType = Icons[type]

  if (!IconType) {
    console.warn(`Icon type "${type}" not found`)
    return null
  }
  let iconSize: IconProps['size']

  switch (size) {
    case 'm':
      iconSize = 'M'
      break
    case 's':
      iconSize = 'S'
      break
    case 'xs':
      iconSize = 'XS'
      break
    case 'xl':
    case 'xxl':
      iconSize = 'XL'
      break
    case 'l':
    default:
      iconSize = 'L'
  }

  return <IconType {...props} size={iconSize} />
}
