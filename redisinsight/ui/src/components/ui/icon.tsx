import React from 'react'
import { MonochromeIconProps } from '@redislabsdev/redis-ui-icons'
import { useTheme } from '@redislabsdev/redis-ui-styles'
import UserInCircle from 'uiSrc/assets/img/icons/user_in_circle.svg?react'
import TriggerIcon from 'uiSrc/assets/img/bulb.svg?react'
import GroupModeIcon from 'uiSrc/assets/img/icons/group_mode.svg?react'
import CloudIcon from 'uiSrc/assets/img/oauth/cloud.svg?react'
import BulkActionsIcon from 'uiSrc/assets/img/icons/bulk_actions.svg?react'
import RedisLogo from 'uiSrc/assets/img/logo_small.svg?react'
import RawModeIcon from 'uiSrc/assets/img/icons/raw_mode.svg?react'
import GithubIcon from 'uiSrc/assets/img/sidebar/github.svg?react'
import CopilotIcon from 'uiSrc/assets/img/icons/copilot.svg?react'

type IconProps = MonochromeIconProps & {
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
}: IconProps) => {
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

export const IconUserInCircle = (props: Omit<IconProps, 'icon'>) => (
  <Icon icon={UserInCircle} {...props} />
)

export const IconTrigger = (props: Omit<IconProps, 'icon'>) => (
  <Icon icon={TriggerIcon} {...props} />
)
export const IconGroup = (props: Omit<IconProps, 'icon'>) => (
  <Icon icon={GroupModeIcon} {...props} />
)

export const IconCloud = (props: Omit<IconProps, 'icon'>) => (
  <Icon icon={CloudIcon} {...props} />
)
export const IconBulkActions = (props: Omit<IconProps, 'icon'>) => (
  <Icon icon={BulkActionsIcon} {...props} />
)
export const IconRedisLogo = (props: Omit<IconProps, 'icon'>) => (
  <Icon icon={RedisLogo} {...props} />
)

export const IconRawMode = (props: Omit<IconProps, 'icon'>) => (
  <Icon icon={RawModeIcon} {...props} />
)
export const IconGithub = (props: Omit<IconProps, 'icon'>) => (
  <Icon icon={GithubIcon} {...props} />
)
export const IconCopilot = (props: Omit<IconProps, 'icon'>) => (
  <Icon icon={CopilotIcon} {...props} />
)
