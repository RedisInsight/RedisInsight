import React, { useCallback } from 'react'
import { EuiButtonIcon, EuiToolTip } from '@elastic/eui'
import { useSelector, useDispatch } from 'react-redux'
import { rejsonSelector, setEditorType } from 'uiSrc/slices/browser/rejson'
import { EditorType } from 'uiSrc/slices/interfaces'

const editorTypeConfigMap = {
  [EditorType.Default]: { opposite: EditorType.Text, label: 'text editor' },
  [EditorType.Text]: { opposite: EditorType.Default, label: 'visual editor' },
}

const ChangeEditorTypeButton = () => {
  const { editorType } = useSelector(rejsonSelector)
  const dispatch = useDispatch()

  const { label, opposite } = editorTypeConfigMap[editorType]

  const handleChangeEditorType = useCallback(() => {
    dispatch(setEditorType(opposite))
  }, [opposite, dispatch])

  return (
    <EuiToolTip content={`Switch to ${label}`} position="right">
      <EuiButtonIcon
        iconType="pencil"
        onClick={handleChangeEditorType}
        aria-label="Change editor type"
      />
    </EuiToolTip>
  )
}

export default ChangeEditorTypeButton
