import React from 'react'
import PubSubActiveSvg from 'uiSrc/assets/img/sidebar/pubsub_active.svg?react'
import { Icon, IconProps } from 'uiSrc/components/base/icons'

export const PubSubActiveIcon = (props: IconProps) => (
  <Icon icon={PubSubActiveSvg} {...props} />
)
