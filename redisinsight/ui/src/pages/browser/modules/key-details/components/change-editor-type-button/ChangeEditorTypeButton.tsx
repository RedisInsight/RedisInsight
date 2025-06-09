import React from 'react'
import { EuiButtonIcon, EuiToolTip } from '@elastic/eui'
import { useChangeEditorType } from './useChangeEditorType'

export enum ButtonMode {
  editable = 'editable',
  readOnly = 'readOnly',
}

export type ChangeEditorTypeButtonProps = {
  mode?: ButtonMode
}

const ChangeEditorTypeButton = ({
  mode = ButtonMode.editable,
}: ChangeEditorTypeButtonProps) => {
  const { switchEditorType, isWithinThreshold } = useChangeEditorType()
  const isReadMode = mode === ButtonMode.readOnly

  const isDisabled = isReadMode || !isWithinThreshold
  const tooltip = isReadMode
    ? 'This JSON document is too large to view or edit in full.'
    : 'Edit value in text editor'

  return (
    <EuiToolTip content={tooltip} position="right">
      <EuiButtonIcon
        iconType="pencil"
        onClick={switchEditorType}
        aria-label="Change editor type"
        disabled={isDisabled}
      />
    </EuiToolTip>
  )
}

export default ChangeEditorTypeButton
