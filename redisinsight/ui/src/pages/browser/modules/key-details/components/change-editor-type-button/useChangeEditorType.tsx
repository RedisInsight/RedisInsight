import { useSelector, useDispatch } from 'react-redux'
import { rejsonSelector, setEditorType } from 'uiSrc/slices/browser/rejson'
import { EditorType } from 'uiSrc/slices/interfaces'

export const useChangeEditorType = () => {
  const dispatch = useDispatch()
  const { editorType } = useSelector(rejsonSelector)
  const opposite =
    editorType === EditorType.Default ? EditorType.Text : EditorType.Default

  const switchEditorType = () => {
    dispatch(setEditorType(opposite))
  }

  return { switchEditorType, editorType }
}
