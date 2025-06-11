import React from 'react'
import PubSubSvg from 'uiSrc/assets/img/sidebar/pubsub.svg?react'
import { Icon, IconProps } from 'uiSrc/components/base/icons'

export const PubSubIcon = (props: IconProps) => (
  <Icon icon={PubSubSvg} {...props} isSvg />
)
