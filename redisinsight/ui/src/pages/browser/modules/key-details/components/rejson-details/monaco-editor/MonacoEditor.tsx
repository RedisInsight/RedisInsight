import React, { useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { EuiFlexItem } from '@elastic/eui'
import { monaco } from 'react-monaco-editor'

import {
  MonacoEditor as Editor,
  useMonacoValidation,
} from 'uiSrc/components/monaco-editor'
import { setReJSONDataAction } from 'uiSrc/slices/browser/rejson'
import {
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { BaseProps } from '../interfaces'
import { useChangeEditorType } from '../../change-editor-type-button'

import styles from '../styles.module.scss'

const ROOT_PATH = '$'

const jsonToReadableString = (data: any) => JSON.stringify(data, null, 2)

const MonacoEditor = (props: BaseProps) => {
  const { data, length, selectedKey } = props
  const dispatch = useDispatch()
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)

  const originalData = jsonToReadableString(data)
  const [value, setValue] = useState(originalData)

  const { isValid, isValidating } = useMonacoValidation(editorRef)
  const isButtonEnabled = isValid && !isValidating && originalData !== value

  const onEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    editorRef.current = editor
  }

  const { switchEditorType } = useChangeEditorType()

  const submitUpdate = () => {
    dispatch(setReJSONDataAction(selectedKey, ROOT_PATH, value, false, length))
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
        <SecondaryButton
          onClick={switchEditorType}
          data-testid="json-data-cancel-btn"
        >
          Cancel
        </SecondaryButton>

        <PrimaryButton
          disabled={!isButtonEnabled}
          onClick={submitUpdate}
          data-testid="json-data-update-btn"
        >
          Overwrite Data
        </PrimaryButton>
      </EuiFlexItem>
    </div>
  )
}

export default MonacoEditor
