import * as monacoLib from 'monaco-editor'
import { useEffect, useState } from 'react'

const errorSeverity = 8

const useMonacoValidation = (
  editorRef: React.MutableRefObject<monacoLib.editor.IStandaloneCodeEditor | null>,
  monacoInstance?: typeof monacoLib,
) => {
  const monaco = monacoInstance || monacoLib

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
      const hasErrors = markers.some((m) => m.severity === errorSeverity)

      setIsValid(!hasErrors)
      setIsValidating(false)
    })

    // Catch formatting or silent model changes that don't touch markers
    const decorationsDisposable = editor.onDidChangeModelDecorations(() => {
      setIsValidating(false)
    })

    // eslint-disable-next-line consistent-return
    return () => {
      contentChangeDisposable.dispose()
      markerChangeDisposable.dispose()
      decorationsDisposable.dispose()
    }
  }, [editorRef, monaco])

  return { isValid, isValidating }
}

export default useMonacoValidation
