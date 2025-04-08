import React from 'react'
import cx from 'classnames'
import { EuiButton, EuiPopover, EuiText } from '@elastic/eui'

import styles from '../../styles.module.scss'

interface ConfirmOverwriteProps {
  isOpen: boolean
  onCancel: () => void
  onConfirm: () => void
  children: NonNullable<React.ReactNode>
}

const ConfirmOverwrite = ({
  isOpen,
  onCancel,
  onConfirm,
  children,
}: ConfirmOverwriteProps) => (
  <EuiPopover
    ownFocus
    initialFocus={false}
    anchorPosition="downRight"
    isOpen={isOpen}
    closePopover={onCancel}
    panelClassName={cx('euiToolTip', 'popoverLikeTooltip')}
    button={children}
  >
    <EuiText size="m" style={{ fontWeight: 'bold' }}>
      Duplicate JSON key detected
    </EuiText>
    <EuiText size="s">
      You already have the same JSON key. If you proceed, a value of the
      existing JSON key will be overwritten.
    </EuiText>

    <div className={styles.confirmDialogActions}>
      <EuiButton
        color="secondary"
        aria-label="Cancel"
        size="s"
        onClick={onCancel}
        data-testid="cancel-confirmation-btn"
      >
        Cancel
      </EuiButton>

      <EuiButton
        fill
        color="secondary"
        aria-label="Overwrite"
        size="s"
        onClick={onConfirm}
        data-testid="overwrite-btn"
      >
        Overwrite
      </EuiButton>
    </div>
  </EuiPopover>
)

export default ConfirmOverwrite
