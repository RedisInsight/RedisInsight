import React, { useEffect, useState } from 'react'
import * as monaco from 'monaco-editor'
import { configureMonacoYaml } from 'monaco-yaml'

import ReactMonacoEditor from 'react-monaco-editor'
import { CommonProps } from 'uiSrc/components/monaco-editor/MonacoEditor'
import example from './example.json'

const MonacoYaml = (props: CommonProps) => {
  const [value, setValue] = useState('')

  useEffect(() => {
    configureMonacoYaml(monaco, {
      enableSchemaRequest: false,
      completion: true,
      schemas: [
        {
          fileMatch: ['*'],
          schema: example.data as any,
          uri: 'http://example.com/schema-name.json',
        }
      ]
    })
  }, [])
  return (
    <ReactMonacoEditor
      width="800"
      height="600"
      language="yaml"
      value={value}
      onChange={setValue}
      options={{
        quickSuggestions: {
          other: 'inline',
          comments: true,
          strings: true,
        },
        suggest: {
          preview: true,
          showStatusBar: true,
          showIcons: false,
        },
      }}
    />
  )
}

export default MonacoYaml
