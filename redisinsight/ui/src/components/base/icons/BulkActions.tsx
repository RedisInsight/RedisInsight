import React from 'react'
import BulkActionsIcon from 'uiSrc/assets/img/icons/bulk_actions.svg?react'
import { Icon, IconProps } from 'uiSrc/components/base/icons'

export const BulkActions = (props: IconProps) => (
  <Icon icon={BulkActionsIcon} {...props} isSvg />
)
