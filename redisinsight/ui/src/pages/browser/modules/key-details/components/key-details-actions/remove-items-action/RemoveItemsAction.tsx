import React from 'react'
import { EuiButtonIcon, EuiToolTip } from '@elastic/eui'

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
    <EuiButtonIcon
      iconType="minusInCircle"
      color="primary"
      aria-label={title}
      onClick={openRemoveItemPanel}
      data-testid="remove-key-value-items-btn"
    />
  </EuiToolTip>
)

export { RemoveItemsAction }
