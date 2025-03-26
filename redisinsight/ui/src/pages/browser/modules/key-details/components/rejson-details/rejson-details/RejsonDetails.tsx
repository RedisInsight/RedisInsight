import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import * as jsonpatch from 'fast-json-patch'
import { EuiButton, EuiFlexItem } from '@elastic/eui'
import { MonacoEditor } from 'uiSrc/components/monaco-editor'
import {
  appendReJSONArrayItemAction,
  removeReJSONKeyAction,
  setReJSONDataAction,
} from 'uiSrc/slices/browser/rejson'

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

const mapJsonPatchOp = ({ path, value }: { path: string; value: any }) => {
  // Example: { path: '/something/this_is_nested', value: true }
  const segments = path.split('/').slice(1) // => something/this_is_nested

  const reJSONPath = segments.reduce(
    (acc, segment) => `${acc}['${segment}']`,
    '$',
  ) // => $['something']['this_is_nested']

  return {
    path: reJSONPath,
    data: String(value),
  }
}

const mapJsonPatchOpsToHandler = (op: any) => {
  const { data, path } = mapJsonPatchOp(op)
  switch (op.op) {
    case 'replace':
      return (key: any) => setReJSONDataAction(key, path, data, true)
    case 'add':
      return (key: any) => appendReJSONArrayItemAction(key, path, data)
    case 'remove':
      return (key: any) => removeReJSONKeyAction(key, path, path)
    default:
      return new Error('This is not supposed to happen')
  }
}

// setReJSONDataAction

const RejsonDetails = (props: BaseProps) => {
  const { data, selectedKey } = props
  const dispatch = useDispatch()

  const originalData = jsonToReadableString(data)
  const [value, setValue] = useState(originalData)
  const hasContentChanged = value !== originalData

  const isValidJson = isValidJSON(value)
  const isUpdateActive = !hasContentChanged || !isValidJson

  const submitUpdate = () => {
    const operations = jsonpatch.compare(data || {}, JSON.parse(value))
    const handlers = operations.map(mapJsonPatchOpsToHandler)
    handlers.forEach((handler) => dispatch(handler(selectedKey)))
  }

  return (
    <div className={styles.jsonData} id="jsonData" data-testid="json-data">
      <MonacoEditor
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
          Update
        </EuiButton>
      </EuiFlexItem>
    </div>
  )
}

export default RejsonDetails
