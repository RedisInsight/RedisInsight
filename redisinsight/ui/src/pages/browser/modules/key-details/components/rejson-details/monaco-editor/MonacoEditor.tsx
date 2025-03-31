import React, { useRef, useState } from 'react'
import { EuiButton, EuiFlexItem } from '@elastic/eui'
import { monaco } from 'react-monaco-editor'

import {
  MonacoEditor as Editor,
  useMonacoValidation,
} from 'uiSrc/components/monaco-editor'
import { BaseProps } from '../interfaces'
import styles from '../styles.module.scss'

const jsonToReadableString = (data: any) => JSON.stringify(data, null, 2)

const MonacoEditor = (props: BaseProps) => {
  const { data } = props
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)

  const originalData = jsonToReadableString(data)
  const [value, setValue] = useState(originalData)

  const { isValid, isValidating } = useMonacoValidation(editorRef)
  const isButtonEnabled = isValid && !isValidating && originalData !== value

  const onEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    editorRef.current = editor
  }

  const submitUpdate = () => {
    // TODO: implement me
  }

  return (
    <div className={styles.jsonData} id="jsonData" data-testid="json-data">
      <Editor
        language="json"
        value={value}
        isEditable
        onChange={setValue}
        data-testid="json-data-editor"
        wrapperClassName={styles.editor}
        editorWrapperClassName={styles.editorWrapper}
        onEditorDidMount={onEditorDidMount}
      />

      <EuiFlexItem className={styles.actions}>
        <EuiButton
          onClick={submitUpdate}
          fill
          color="secondary"
          disabled={!isButtonEnabled}
          data-testid="json-data-update-btn"
        >
          {/* TODO: Make sure this is the best text for the users */}
          Replace Entire Value
        </EuiButton>
      </EuiFlexItem>
    </div>
  )
}

export default MonacoEditor
