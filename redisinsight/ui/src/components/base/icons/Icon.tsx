import React from 'react'
import { MonochromeIconProps } from '@redislabsdev/redis-ui-icons'
import { useTheme } from '@redislabsdev/redis-ui-styles'
import RedisLogo from 'uiSrc/assets/img/logo_small.svg?react'
import RawModeIcon from 'uiSrc/assets/img/icons/raw_mode.svg?react'
import GithubIcon from 'uiSrc/assets/img/sidebar/github.svg?react'
import CopilotIcon from 'uiSrc/assets/img/icons/copilot.svg?react'

type BaseIconProps = MonochromeIconProps & {
  icon: React.ComponentType<any>
}
const sizesMap = {
  XS: 8,
  S: 12,
  M: 16,
  L: 20,
  XL: 24,
}

export const Icon = ({
  icon: IconComponent,
  customSize,
  customColor,
  title: titleProp,
  color = 'primary600',
  size = 'L',
  ...rest
}: BaseIconProps) => {
  const sizeValue = customSize || sizesMap[size]
  const theme = useTheme()
  const colorValue = customColor || theme.semantic.color.icon[color]
  const props = {
    color: colorValue,
    width: sizeValue,
    height: sizeValue,
    ...rest,
  }

  return <IconComponent {...props} />
}

export type IconProps = Omit<BaseIconProps, 'icon'>

export const IconRedisLogo = (props: IconProps) => (
  <Icon icon={RedisLogo} {...props} />
)

export const IconRawMode = (props: IconProps) => (
  <Icon icon={RawModeIcon} {...props} />
)
export const IconGithub = (props: IconProps) => (
  <Icon icon={GithubIcon} {...props} />
)
export const IconCopilot = (props: IconProps) => (
  <Icon icon={CopilotIcon} {...props} />
)
