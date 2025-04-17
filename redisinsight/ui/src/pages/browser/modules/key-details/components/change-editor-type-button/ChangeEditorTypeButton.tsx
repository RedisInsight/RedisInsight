import React from 'react'
import { EuiButtonIcon, EuiToolTip } from '@elastic/eui'
import { useChangeEditorType } from './useChangeEditorType'

const ChangeEditorTypeButton = () => {
  const { switchEditorType } = useChangeEditorType()

  return (
    <EuiToolTip content="Edit value in text editor" position="right">
      <EuiButtonIcon
        iconType="pencil"
        onClick={switchEditorType}
        aria-label="Change editor type"
      />
    </EuiToolTip>
  )
}

export default ChangeEditorTypeButton
