import React from 'react'
import { EuiToolTip } from '@elastic/eui'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { EditIcon } from 'uiSrc/components/base/icons'
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
  const { switchEditorType } = useChangeEditorType()
  const isReadMode = mode === ButtonMode.readOnly

  const isDisabled = isReadMode
  const tooltip = isReadMode
    ? 'This JSON is too large to edit'
    : 'Edit value in text editor'

  return (
    <EuiToolTip content={tooltip} position="right">
      <IconButton
        size="S"
        icon={EditIcon}
        onClick={switchEditorType}
        aria-label="Change editor type"
        disabled={isDisabled}
      />
    </EuiToolTip>
  )
}

export default ChangeEditorTypeButton
