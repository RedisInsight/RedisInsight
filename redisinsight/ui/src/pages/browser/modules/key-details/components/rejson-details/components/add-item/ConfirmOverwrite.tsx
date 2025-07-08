import React from 'react'
import cx from 'classnames'

import {
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { Text } from 'uiSrc/components/base/text'
import { RiPopover } from 'uiSrc/components/base'
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
  <RiPopover
    ownFocus
    anchorPosition="downRight"
    isOpen={isOpen}
    closePopover={onCancel}
    panelClassName={cx('popoverLikeTooltip')}
    button={children}
  >
    <Text size="m" style={{ fontWeight: 'bold' }}>
      Duplicate JSON key detected
    </Text>
    <Text size="s">
      You already have the same JSON key. If you proceed, a value of the
      existing JSON key will be overwritten.
    </Text>

    <div className={styles.confirmDialogActions}>
      <SecondaryButton
        aria-label="Cancel"
        size="small"
        onClick={onCancel}
        data-testid="cancel-confirmation-btn"
      >
        Cancel
      </SecondaryButton>

      <PrimaryButton
        aria-label="Overwrite"
        size="small"
        onClick={onConfirm}
        data-testid="overwrite-btn"
      >
        Overwrite
      </PrimaryButton>
    </div>
  </RiPopover>
)

export default ConfirmOverwrite
