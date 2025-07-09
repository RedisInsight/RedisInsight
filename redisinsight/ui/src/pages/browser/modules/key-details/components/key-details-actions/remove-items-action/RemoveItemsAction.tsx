import React from 'react'

import { RiTooltip } from 'uiSrc/components'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { MinusInCircleIcon } from 'uiSrc/components/base/icons'

export interface Props {
  title: string
  openRemoveItemPanel: () => void
}

const RemoveItemsAction = ({ title, openRemoveItemPanel }: Props) => (
  <RiTooltip content={title} position="left">
    <IconButton
      icon={MinusInCircleIcon}
      aria-label={title}
      onClick={openRemoveItemPanel}
      data-testid="remove-key-value-items-btn"
    />
  </RiTooltip>
)

export { RemoveItemsAction }
