import { useState, useEffect } from 'react'
import * as monaco from 'monaco-editor'

const useMonacoValidation = (
  editorRef: React.MutableRefObject<monaco.editor.IStandaloneCodeEditor | null>,
) => {
  const [isValid, setIsValid] = useState(false)
  const [isValidating, setIsValidating] = useState(false)

  useEffect(() => {
    if (!editorRef.current) return

    const editor = editorRef.current
    const model = editor.getModel()
    if (!model) return

    // Mark as "validating" when content changes
    const contentChangeDisposable = editor.onDidChangeModelContent(() => {
      setIsValidating(true)
    })

    // Update validation when markers change
    // Listening to markers change event is debounced
    const markerChangeDisposable = monaco.editor.onDidChangeMarkers((uris) => {
      if (!editorRef.current) return
      if (!uris.some((u) => u.toString() === model.uri.toString())) return

      const markers = monaco.editor.getModelMarkers({ resource: model.uri })
      const hasErrors = markers.some(
        (m) => m.severity === monaco.MarkerSeverity.Error,
      )
      setIsValid(!hasErrors)
      setIsValidating(false)
    })

    // eslint-disable-next-line consistent-return
    return () => {
      contentChangeDisposable.dispose()
      markerChangeDisposable.dispose()
    }
  }, [editorRef])

  return { isValid, isValidating }
}

export default useMonacoValidation
