import React from 'react'

import { RiTooltip } from 'uiSrc/components'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { MinusInCircleIcon } from 'uiSrc/components/base/icons'
import styles from '../styles.module.scss'

export interface Props {
  title: string
  openRemoveItemPanel: () => void
}

const RemoveItemsAction = ({ title, openRemoveItemPanel }: Props) => (
  <RiTooltip content={title} position="left" anchorClassName={styles.actionBtn}>
    <IconButton
      icon={MinusInCircleIcon}
      aria-label={title}
      onClick={openRemoveItemPanel}
      data-testid="remove-key-value-items-btn"
    />
  </RiTooltip>
)

export { RemoveItemsAction }
