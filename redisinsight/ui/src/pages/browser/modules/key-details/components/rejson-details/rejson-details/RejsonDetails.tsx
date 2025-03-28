import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import * as jsonpatch from 'fast-json-patch'
import { EuiButton, EuiFlexItem } from '@elastic/eui'
import { get } from 'lodash'
import { MonacoEditor } from 'uiSrc/components/monaco-editor'
import {
  appendReJSONArrayItemAction,
  removeReJSONKeyAction,
  setReJSONDataAction,
} from 'uiSrc/slices/browser/rejson'

import { BaseProps } from '../interfaces'
import { isRealArray } from '../utils'

import styles from '../styles.module.scss'

// TODO: potentially remove getBrackets, isRealObject, isRealArray, AddItem
// TODO: potentially remove setAddRootKVPair, removeReJSONKeyAction, appendReJSONArrayItemAction
// TODO: check what constraints are - size, is it possible to optimise this?
const jsonToReadableString = (data: any) => JSON.stringify(data, null, 2)

// TODO: potentially use the validation of MonacoEditor
const isValidJSON = (input: string): { result: boolean; parsed?: any } => {
  try {
    const parsed = JSON.parse(input)
    return { result: true, parsed }
  } catch (e) {
    return { result: false }
  }
}

const mapJsonPatchOp = ({ path, value }: { path: string; value: any }) => {
  // Example: { path: '/something/this_is_nested', value: true }
  const segments = path.split('/').slice(1) // => something/this_is_nested

  // const reJSONPath = segments.reduce(
  //   (acc, segment) => `${acc}['${segment}']`,
  //   '$',
  // ) // => $['something']['this_is_nested']
  const reJSONPath = segments.map((segment, i) => [
    i === 0 ? `$['${segment}']` : `['${segment}']`,
  ])

  // Because the characters '~' (%x7E) and '/' (%x2F) have special
  // meanings in JSON Pointer, '~' needs to be encoded as '~0' and '/'
  // needs to be encoded as '~1' when these characters appear in a
  // reference token.
  // Ref: https://www.rfc-editor.org/rfc/rfc6901.html#section-3
  const nativePath = segments.map((segment) =>
    segment.replaceAll('~1', '/').replaceAll('~0', '~'),
  ) // => ['something', 'this_is_nested']

  return {
    reJSONPath,
    data: String(value),
    nativePath,
    originalData: value,
  }
}

const prepareArrayPath = (path: string[][]) => {
  const result = path.slice(0, -1).join('')

  if (!result) {
    return path.join('')
  }

  return result
}

const mapJsonPatchOpsToHandler = (op: any, jsonContent: any) => {
  const { data, reJSONPath, nativePath, originalData } = mapJsonPatchOp(op)
  const path = reJSONPath.length ? reJSONPath.join('') : '$'
  // TODO: handle array append element that is not last

  switch (op.op) {
    case 'replace':
      return (key: any) => setReJSONDataAction(key, path, data, true)
    case 'add': {
      const parentPath = nativePath.slice(0, -1)
      const parent = get(jsonContent, parentPath)

      if (isRealArray(originalData)) {
        const arrayPath = prepareArrayPath(reJSONPath)

        return (key: any) =>
          setReJSONDataAction(
            key,
            arrayPath,
            JSON.stringify(originalData),
            true,
          )
      }

      if (isRealArray(parent)) {
        const arrayPath = prepareArrayPath(reJSONPath)
        return (key: any) => appendReJSONArrayItemAction(key, arrayPath, data)
      }

      // TODO: data should be stringified again, but don't know why
      return (key: any) =>
        setReJSONDataAction(key, path, JSON.stringify(data), true)
    }
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

  const { result: isValidContent, parsed } = isValidJSON(value)
  const isUpdateActive = !hasContentChanged || !isValidContent

  const submitUpdate = () => {
    const operations = jsonpatch.compare(data || {}, JSON.parse(value))
    console.log('operations :>> ', operations)
    const handlers = operations.map((o) => mapJsonPatchOpsToHandler(o, parsed))
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
