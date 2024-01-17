import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import cx from 'classnames'

import { setReJSONDataAction } from 'uiSrc/slices/browser/rejson'
import InlineItemEditor from 'uiSrc/components/inline-item-editor/InlineItemEditor'
import PopoverDelete from 'uiSrc/pages/browser/components/popover-delete/PopoverDelete'
import { bufferToString, createDeleteFieldHeader, createDeleteFieldMessage } from 'uiSrc/utils'
import FieldMessage from 'uiSrc/components/field-message/FieldMessage'
import {
  JSONScalarValue,
  IJSONObject,
  JSONScalarProps
} from 'uiSrc/pages/browser/modules/key-details/components/rejson-details/interfaces'

import {
  generatePath,
  getClassNameByValue,
  validateRejsonValue
} from 'uiSrc/pages/browser/modules/key-details/components/rejson-details/utils'

import styles from '../styles.module.scss'
import '../styles.scss'

const RejsonScalar = (props: JSONScalarProps) => {
  const {
    keyName,
    value,
    parentPath,
    leftPadding,
    selectedKey,
    path: currentFullPath,
    handleSubmitRemoveKey,
    handleSubmitJsonUpdateValue
  } = props
  const [changedValue, setChangedValue] = useState<any>('')
  const [path] = useState<string>(currentFullPath || generatePath(parentPath, keyName))
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<boolean>(false)
  const [deleting, setDeleting] = useState<string>('')

  const dispatch = useDispatch()

  const isBigString = keyName === null

  useEffect(() => {
    let val = value
    if (value === null) {
      val = JSON.stringify(value)
    }
    if (typeof value === 'string') {
      val = `"${value}"`
    }

    setChangedValue(val)
  }, [value])

  const onDeclineChanges = () => {
    setEditing(false)
    setError(null)
  }

  const onApplyValue = (value: JSONScalarValue) => {
    const error: null | string = validateRejsonValue(value)
    if (error) {
      setError(error)
      return
    }

    const body: IJSONObject = {
      path,
      operation: 'update',
      value
    }

    handleSubmitJsonUpdateValue(body)
    dispatch<any>(setReJSONDataAction(
      selectedKey as string,
      path,
      String(value),
      () => setEditing(false)
    ))
  }

  return (
    <>
      <div>
        {isBigString ? (
          <p
            style={{ border: 'None', padding: '0em' }}
            className={getClassNameByValue(value)}
          >
            {`${changedValue}`}
          </p>
        ) : (
          <div className={styles.row}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', flexGrow: 1, }}>
                <span className="flex-row" style={{ alignItems: 'flex-end' }}>
                  <span
                    className={cx(styles.keyName, styles.quoted)}
                    style={{ paddingLeft: `${leftPadding}em`, }}
                  >
                    {keyName}
                  </span>
                  <span style={{ paddingLeft: '0.2em' }}>:</span>
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
      </div>
    </>
  )
}

export default RejsonScalar
