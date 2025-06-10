import React from 'react'
import { EuiButtonIcon, EuiToolTip } from '@elastic/eui'
import { useChangeEditorType } from './useChangeEditorType'

const ChangeEditorTypeButton = () => {
  const { switchEditorType, isTextEditorDisabled } = useChangeEditorType()

  const isDisabled = isTextEditorDisabled
  const tooltip = isTextEditorDisabled
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
