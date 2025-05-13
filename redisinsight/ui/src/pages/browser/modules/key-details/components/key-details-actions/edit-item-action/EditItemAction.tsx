import React from 'react'
import { EuiToolTip } from '@elastic/eui'
import { Nullable } from 'uiSrc/utils'

import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { EditIcon } from 'uiSrc/components/base/icons'
import styles from '../styles.module.scss'

export interface Props {
  title: string
  isEditable: boolean
  tooltipContent: Nullable<string>
  onEditItem: () => void
}

const EditItemAction = ({
  title,
  isEditable,
  tooltipContent,
  onEditItem,
}: Props) => (
  <div className={styles.actionBtn}>
    <EuiToolTip content={tooltipContent} data-testid="edit-key-value-tooltip">
      <IconButton
        disabled={!isEditable}
        icon={EditIcon}
        aria-label={title}
        onClick={onEditItem}
        data-testid="edit-key-value-btn"
      />
    </EuiToolTip>
  </div>
)

export { EditItemAction }
