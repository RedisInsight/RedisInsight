import React from 'react'

import LikeSvg from 'uiSrc/assets/img/icons/like.svg?react'
import { Icon, IconProps } from 'uiSrc/components/base/icons'

export const LikeIcon = (props: IconProps) => <Icon icon={LikeSvg} {...props} isSvg />
