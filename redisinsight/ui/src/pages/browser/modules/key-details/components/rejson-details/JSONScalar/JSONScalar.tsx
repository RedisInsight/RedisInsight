import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import cx from 'classnames'

import { setReJSONDataAction } from 'uiSrc/slices/browser/rejson'
import InlineItemEditor from 'uiSrc/components/inline-item-editor/InlineItemEditor'
import PopoverDelete from 'uiSrc/pages/browser/components/popover-delete/PopoverDelete'
import { bufferToString, createDeleteFieldHeader, createDeleteFieldMessage } from 'uiSrc/utils'
import FieldMessage from 'uiSrc/components/field-message/FieldMessage'
import { JSONErrors } from '../constants'
import { JSONScalarValue, IJSONObject } from '../JSONInterfaces'

import { getClassNameByValue } from '../JSONUtils/JSONUtils'
import styles from '../styles.module.scss'
import '../styles.scss'

// This interface has been kept empty for now. If any changes is to be made to the body format for updating purpose , the necessary properties will be added here.
interface UpdateValueBody {
}

export interface Props {
  bigString?: boolean;
  keyName: string | number;
  value: JSONScalarValue;
  parentPath: string;
  selectedKey: string;
  leftPadding: String;
  deleteMsg: string;
  instanceId: number;
  dbNumber: number;
  selectedKeyDataType?: string;
  shouldRejsonDataBeDownloaded: boolean;
  handleSubmitUpdateValue?: (body: UpdateValueBody) => void;
  handleSubmitJsonUpdateValue: (body: UpdateValueBody) => Promise<void>;
  handleSubmitRemoveKey: (path: string, jsonKeyName: string) => void;
  handleDeleteKeyDialogOpen?: () => void;
  resultTableKeyMap: {};
  onJSONPropertyEdited: () => void;
  onJSONPropertyDeleted: () => void;
  onJSONPropertyAdded: () => void;
}

const JSONScalar = (props: Props) => {
  const { keyName, parentPath, value, bigString, leftPadding, handleSubmitRemoveKey, selectedKey } = props
  const [changedValue, setChangedValue] = useState<any>('')
  const [path, setPath] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [editing, setEditing] = useState<boolean>(false)
  const [deleting, setDeleting] = useState('')

  const dispatch = useDispatch()

  useEffect(() => {
    let path = ''
    if (typeof keyName === 'number') {
      path = `${parentPath}[${keyName}]`
    } else {
      path = keyName.includes('"') ? `${parentPath}['${keyName}']` : `${parentPath}["${keyName}"]`
    }

    let val = value
    if (value === null) {
      val = JSON.stringify(value)
    }
    if (typeof value === 'string') {
      val = `"${value}"`
    }

    setChangedValue(val)
    setPath(path)
  }, [parentPath, keyName, value])

  const validateJSONValue = (value: JSONScalarValue) => {
    let error: string = ''

    try {
      JSON.parse(value as string)
    } catch (e) {
      error = JSONErrors.valueJSONFormat
    }

    return error
  }

  const onDeclineChanges = () => {
    setEditing(false)
    setError('')
  }

  const onApplyValue = (value: JSONScalarValue) => {
    const {
      handleSubmitJsonUpdateValue,
      onJSONPropertyEdited,
      selectedKey
    } = props

    const error: string = validateJSONValue(value)

    if (error === '') {
      const body: IJSONObject = {}

      body.path = path
      body.operation = 'update'
      body.value = value

      onJSONPropertyEdited()
      handleSubmitJsonUpdateValue(body)

      dispatch<any>(setReJSONDataAction(
        selectedKey,
        path,
        String(value),
        () => setEditing(false)
      ))
    } else {
      setError(error)
    }
  }

  return (
    <>
      {bigString ? (
        <p
          style={{ border: 'None', padding: '0em' }}
          className={getClassNameByValue(value)}
        >
          {`${changedValue}`}
        </p>
      ) : (
        <div
          className={styles.row}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              width: '100%'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                flexGrow: 1,
              }}
            >
              <span className="flex-row" style={{ alignItems: 'flex-end' }}>
                <span
                  className={cx(styles.keyName, styles.quoted)}
                  style={{
                    paddingLeft: `${leftPadding}em`,
                  }}
                >
                  {keyName}
                </span>
                <span
                  style={{ paddingLeft: '0.2em' }}
                >
                  :
                </span>
              </span>
              {editing ? (
                <div className="jsonItemEditor">
                  <InlineItemEditor
                    initialValue={changedValue}
                    controlsPosition="right"
                    placeholder="Enter JSON value"
                    fieldName="stringValue"
                    expandable
                    isInvalid={!!error}
                    onDecline={onDeclineChanges}
                    onChange={() => setError('')}
                    onApply={(value) => onApplyValue(value)}
                    iconSize="m"
                  />
                  {error && (
                  <div className={cx(styles.errorMessage)}>
                    <FieldMessage
                      scrollViewOnAppear
                      icon="alert"
                      testID="edit-json-error"
                    >
                      {error}
                    </FieldMessage>
                  </div>
                  )}
                </div>
              ) : (
                <span
                  className={cx(styles.jsonValue, getClassNameByValue(value))}
                  onClick={() => setEditing(true)}
                  style={{ flexGrow: 1 }}
                  data-testid="json-scalar-value"
                  role="presentation"
                >
                  {String(changedValue)}
                </span>
              )}
            </div>
            <div className={styles.deleteBtn}>
              <PopoverDelete
                header={createDeleteFieldHeader(keyName.toString())}
                text={createDeleteFieldMessage(bufferToString(selectedKey))}
                item={keyName.toString()}
                suffix="scalar"
                deleting={deleting}
                closePopover={() => setDeleting('')}
                updateLoading={false}
                showPopover={(item) => setDeleting(`${item}scalar`)}
                handleDeleteItem={() => handleSubmitRemoveKey(path, keyName.toString())}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default JSONScalar
