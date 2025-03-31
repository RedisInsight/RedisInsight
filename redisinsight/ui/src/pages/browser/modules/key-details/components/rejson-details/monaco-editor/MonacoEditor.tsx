import React, { useState } from 'react'
import { EuiButton, EuiFlexItem } from '@elastic/eui'
import { MonacoEditor as Editor } from 'uiSrc/components/monaco-editor'
import { BaseProps } from '../interfaces'

import styles from '../styles.module.scss'

const jsonToReadableString = (data: any) => JSON.stringify(data, null, 2)

// TODO: potentially use the validation of MonacoEditor
const isValidJSON = (input: string): boolean => {
  try {
    JSON.parse(input)
    return true
  } catch (e) {
    return false
  }
}

const MonacoEditor = (props: BaseProps) => {
  const { data } = props

  const originalData = jsonToReadableString(data)
  const [value, setValue] = useState(originalData)
  const hasContentChanged = value !== originalData

  const isValidContent = isValidJSON(value)
  const isUpdateActive = !hasContentChanged || !isValidContent

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
      />

      <EuiFlexItem className={styles.actions}>
        <EuiButton
          onClick={submitUpdate}
          fill
          color="secondary"
          disabled={isUpdateActive}
          data-testid="json-data-update-btn"
        >
          {/* TODO: Make sure this is the best text to the users */}
          Replace Entire Value
        </EuiButton>
      </EuiFlexItem>
    </div>
  )
}

export default MonacoEditor
