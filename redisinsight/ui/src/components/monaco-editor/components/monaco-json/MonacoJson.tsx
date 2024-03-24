import React from 'react'
import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api'

import { MonacoEditor } from 'uiSrc/components/monaco-editor'
import { CommonProps } from 'uiSrc/components/monaco-editor/MonacoEditor'


function getWorkerUrl(moduleId, label) {
  if (['json', 'typescript', 'javascript'].includes(label)) {
    return `${label}.worker.js`
  }

  return 'editor.worker.js'
}

window.MonacoEnvironment = {
  getWorkerUrl: (moduleId, label) => {
    let workerUrl = getWorkerUrl(moduleId, label)
    const proxyPath = window.__RIPROXYPATH__ || ''
    if (proxyPath) {
      workerUrl = proxyPath + '/' + workerUrl
    }
    return workerUrl
  }
}

const MonacoJson = (props: CommonProps) => {
  const editorDidMount = (
    editor: monacoEditor.editor.IStandaloneCodeEditor,
    monaco: typeof monacoEditor,
  ) => {
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      schemaValidation: 'error',
      schemaRequest: 'error',
      trailingCommas: 'error'
    })
    const messageContribution = editor.getContribution('editor.contrib.messageController')
    editor.onDidAttemptReadOnlyEdit(() => messageContribution.dispose())
  }

  return (
    <MonacoEditor
      {...props}
      language="json"
      className="json-monaco-editor"
      onEditorDidMount={editorDidMount}
    />
  )
}

export default MonacoJson
