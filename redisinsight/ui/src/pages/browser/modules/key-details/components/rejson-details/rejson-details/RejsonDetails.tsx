import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { EuiButton, EuiFlexItem } from '@elastic/eui'
import { MonacoEditor } from 'uiSrc/components/monaco-editor'

import { BaseProps } from '../interfaces'

import styles from '../styles.module.scss'

// TODO: potentially remove getBrackets, isRealObject, isRealArray, AddItem
// TODO: potentially remove setAddRootKVPair, removeReJSONKeyAction, appendReJSONArrayItemAction
// TODO: check what constraints are - size, is it possible to optimise this?
const jsonToReadableString = (data: any) => JSON.stringify(data, null, 2)

// TODO: potentially use the validation of MonacoEditor
const isValidJSON = (input: string) => {
  try {
    JSON.parse(input)
    return true
  } catch (e) {
    return false
  }
}

// setReJSONDataAction

const RejsonDetails = (props: BaseProps) => {
  const { data } = props
  const dispatch = useDispatch()

  const originalData = jsonToReadableString(data)
  const [value, setValue] = useState(originalData)
  const hasContentChanged = value !== originalData

  const isValidJson = isValidJSON(value)
  const isUpdateActive = !hasContentChanged || !isValidJson

  return (
    <div className={styles.jsonData} id="jsonData" data-testid="json-data">
      <MonacoEditor
        language="json"
        value={value}
        isEditable
        onChange={setValue}
        data-testid="json-data-editor"
      />

      <EuiFlexItem grow={false} className={styles.actions}>
        <EuiButton
          onClick={() => {}}
          fill
          color="secondary"
          disabled={isUpdateActive}
          data-testid="json-data-update-btn"
        >
          Update
        </EuiButton>
      </EuiFlexItem>
    </div>
  )
}

export default RejsonDetails
