import React from 'react'
import { monaco as monacoEditor } from 'react-monaco-editor'

import { MonacoEditor } from 'uiSrc/components/monaco-editor'
import { CommonProps } from 'uiSrc/components/monaco-editor/MonacoEditor'

const MonacoJS = (props: CommonProps) => {
  const editorDidMount = (
    editor: monacoEditor.editor.IStandaloneCodeEditor
  ) => {
    const messageContribution = editor.getContribution('editor.contrib.messageController')
    editor.onDidAttemptReadOnlyEdit(() => messageContribution?.dispose())
  }

  return (
    <MonacoEditor
      {...props}
      language="javascript"
      className="javascript-monaco-editor"
      onEditorDidMount={editorDidMount}
    />
  )
}

export default MonacoJS
