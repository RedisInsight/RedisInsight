import { useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { rejsonSelector, setEditorType } from 'uiSrc/slices/browser/rejson'
import { EditorType } from 'uiSrc/slices/interfaces'

export const useChangeEditorType = () => {
  const dispatch = useDispatch()
  const { editorType } = useSelector(rejsonSelector)

  const switchEditorType = useCallback(() => {
    const opposite =
      editorType === EditorType.Default ? EditorType.Text : EditorType.Default
    dispatch(setEditorType(opposite))
  }, [dispatch, editorType])

  return { switchEditorType, editorType }
}
