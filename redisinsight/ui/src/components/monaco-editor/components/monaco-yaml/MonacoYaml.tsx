import React, { useState } from 'react'
import { configureMonacoYaml } from 'monaco-yaml'
import { monaco as monacoEditor } from 'react-monaco-editor'

import { CommonProps } from 'uiSrc/components/monaco-editor/MonacoEditor'
import { MonacoEditor } from 'uiSrc/components/monaco-editor'
import example from './example'

const MonacoYaml = (props: CommonProps) => {
  const [value, setValue] = useState('')

  const editorDidMount = (
    _: monacoEditor.editor.IStandaloneCodeEditor,
    monaco: typeof monacoEditor,
  ) => {
    configureMonacoYaml(monaco, {
      hover: true,
      schemas: [
        {
          fileMatch: ['*'],
          schema: example.data.ingest as any,
          uri: 'http://example.com/schema-name.json',
        }
      ]
    })
  }

  return (
    <MonacoEditor
      {...props}
      language="yaml"
      value={value}
      onChange={setValue}
      onEditorDidMount={editorDidMount}
      options={{
        hover: {
          enabled: true,
        },
        stickyScroll: {
          enabled: true,
          defaultModel: 'foldingProviderModel'
        },
        tabSize: 2,
        insertSpaces: true,
        renderWhitespace: 'boundary',
        quickSuggestions: {
          other: 'inline',
          comments: true,
          strings: true,
        },
        suggest: {
          preview: true,
          showStatusBar: true,
          showIcons: true,
          showProperties: true,
        },
      }}
    />
  )
}

export default MonacoYaml
