import React from 'react'
import { EuiToolTip } from '@elastic/eui'

import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { MinusInCircleIcon } from 'uiSrc/components/base/icons'
import styles from '../styles.module.scss'

export interface Props {
  title: string
  openRemoveItemPanel: () => void
}

const RemoveItemsAction = ({ title, openRemoveItemPanel }: Props) => (
  <EuiToolTip
    content={title}
    position="left"
    anchorClassName={styles.actionBtn}
  >
    <IconButton
      icon={MinusInCircleIcon}
      aria-label={title}
      onClick={openRemoveItemPanel}
      data-testid="remove-key-value-items-btn"
    />
  </EuiToolTip>
)

export { RemoveItemsAction }
