import React, { FormEvent, useState } from 'react'
import { connect } from 'react-redux'
import cx from 'classnames'
import {
  EuiButtonIcon,
  EuiFieldText,
  EuiFlexItem,
  EuiFocusTrap,
  EuiForm,
  EuiOutsideClickDetector,
  EuiWindowEvent
} from '@elastic/eui'
import {
  appendReJSONArrayItemAction,
  fetchVisualisationResults,
  removeReJSONKeyAction,
  setReJSONDataAction
} from 'uiSrc/slices/browser/rejson'
import FieldMessage from 'uiSrc/components/field-message/FieldMessage'
import { bufferToString } from 'uiSrc/utils'
import {
  IJSONObject,
  IJSONValue,
  JSONScalarValue,
  ChangeEvent,
  BaseProps,
} from 'uiSrc/pages/browser/modules/key-details/components/rejson-details/interfaces'
import { RejsonDynamicTypes } from 'uiSrc/pages/browser/modules/key-details/components/rejson-details/rejson-dynamic-types'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import RejsonScalar from 'uiSrc/pages/browser/modules/key-details/components/rejson-details/rejson-scalar/RejsonScalar'
import { JSONErrors } from 'uiSrc/pages/browser/modules/key-details/components/rejson-details/constants'

import styles from '../styles.module.scss'

const RejsonDetails = (props: BaseProps) => {
  const {
    data,
    selectedKey,
    dataType,
    parentPath,
    shouldRejsonDataBeDownloaded,
    onJsonKeyExpandAndCollapse,
    handleFetchVisualisationResults,
    handleSubmitJsonUpdateValue,
    handleSubmitUpdateValue,
    handleRemoveRejsonKeyAction,
    handleAppendRejsonArrayItemAction,
    handleSetRejsonDataAction,
  } = props

  const [path] = useState<string>('')
  const [addRootKVPair, setAddRootKVPair] = useState<boolean>(false)
  const [newRootKey, setNewRootKey] = useState<string>('')
  const [newRootValue, setNewRootValue] = useState<IJSONValue>('')
  const [error, setError] = useState<string | null>(null)

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onClickSubmitRootKVPair()
  }

  const handlerResetAddRootKVPair = () => {
    setError(null)
    setAddRootKVPair(false)
    setNewRootKey('')
    setNewRootValue('')
  }

  const handleOnEsc = (e: KeyboardEvent) => {
    if (e.code.toLowerCase() === 'escape' || e.keyCode === 27) {
      e.stopPropagation()
      handlerResetAddRootKVPair()
    }
  }

  const onClickRemoveKey = (path: string, keyName: string) => {
    const body: IJSONObject = {
      operation: 'remove',
      path
    }

    handleSubmitJsonUpdateValue(body)
    handleRemoveRejsonKeyAction(selectedKey, path || '.', keyName)
  }

  const onClickSetRootKVPair = () => {
    setAddRootKVPair(!addRootKVPair)
  }

  const onChangeSetRootKey = (newRootKey: string) => {
    setNewRootKey(newRootKey)
    setError(null)
  }

  const onChangeSetRootValue = (value: IJSONValue) => {
    setNewRootValue(value || '')
    setError(null)
  }

  const validateRootKVPair = (): string | null => {
    const isObject = shouldRejsonDataBeDownloaded && dataType === 'object'
    const isArray = !shouldRejsonDataBeDownloaded && !(data instanceof Array)

    if ((isObject || isArray) && (!isValidKey(newRootKey) || !isValidJSON(newRootValue as string))) {
      return JSONErrors.keyCorrectSyntax
    }

    if (!isValidJSON(newRootValue as string)) {
      return JSONErrors.valueJSONFormat
    }

    return null
  }

  const isValidKey = (key: string): boolean => {
    if (!key || !key.startsWith('"') || !key.endsWith('"')) {
      return false
    }

    try {
      const unescapedKey = JSON.parse(key)
      return !unescapedKey.includes('"') || !unescapedKey.includes("'")
    } catch (e) {
      return false
    }
  }

  const isValidJSON = (value: string): boolean => {
    try {
      JSON.parse(value || '')
      return true
    } catch (e) {
      return false
    }
  }

  const onClickSubmitRootKVPair = () => {
    setAddRootKVPair(false)

    const error: string | null = validateRootKVPair()
    if (error) {
      setError(error)
      setAddRootKVPair(true)
      return
    }

    const body: IJSONObject = {
      operation: 'update',
      value: newRootValue,
      previous_path: path as string,
      new_key: newRootKey as string,
      type: null,
      path: null
    }

    if (data instanceof Array && dataType !== 'object') {
      body.type = 'array'
      body.path = '.'
      handleAppendRejsonArrayItemAction(selectedKey, '.', newRootValue as string)
    } else {
      const unescapedKey = JSON.parse(newRootKey as string)
      const updatedPath = unescapedKey.includes('"') ? `['${unescapedKey}']` : `["${unescapedKey}"]`
      body.path = updatedPath
      handleSetRejsonDataAction(selectedKey, updatedPath, newRootValue as string)
    }

    handleSubmitJsonUpdateValue(body)
  }

  return (
    <div className={styles.jsonData} id="jsonData" data-testid="json-data">
      <div>
        {typeof data === 'object' && data !== null && !(data instanceof Array)
          ? (
            <div className={styles.row}>
              <span>&#123;</span>
            </div>
          ) : null}
        {data instanceof Array && (dataType === 'object'
          ? (<div className={styles.row}><span>&#123;</span></div>)
          : (<div className={styles.row}><span>&#91;</span></div>)
        )}
        <>
          {data ? (
            <RejsonDynamicTypes
              data={data}
              parentPath={parentPath}
              selectedKey={selectedKey}
              onClickRemoveKey={onClickRemoveKey}
              shouldRejsonDataBeDownloaded={shouldRejsonDataBeDownloaded}
              onJsonKeyExpandAndCollapse={onJsonKeyExpandAndCollapse}
              handleSubmitJsonUpdateValue={handleSubmitJsonUpdateValue}
              handleSubmitUpdateValue={handleSubmitUpdateValue}
              handleAppendRejsonArrayItemAction={handleAppendRejsonArrayItemAction}
              handleSetRejsonDataAction={handleSetRejsonDataAction}
              handleFetchVisualisationResults={handleFetchVisualisationResults}
            />
          ) : (
            <RejsonScalar
              leftPadding="1"
              selectedKey={selectedKey}
              parentPath=""
              keyName={bufferToString(selectedKey)}
              value={data as JSONScalarValue}
              handleSubmitRemoveKey={(path: string, keyName: string) => onClickRemoveKey(path, keyName)}
              handleSubmitJsonUpdateValue={handleSubmitJsonUpdateValue}
            />
          )}
        </>
        {addRootKVPair ? (
          <div className={styles.row} style={{ display: 'flex', flexDirection: 'row' }}>
            <EuiOutsideClickDetector onOutsideClick={handlerResetAddRootKVPair}>
              <div>
                <EuiWindowEvent event="keydown" handler={(e) => handleOnEsc(e)} />
                <EuiFocusTrap>
                  <EuiForm
                    component="form"
                    className="relative"
                    onSubmit={(e) => handleFormSubmit(e)}
                    style={{ display: 'flex' }}
                    noValidate
                  >
                    {(typeof data === 'object' && data !== null && !(data instanceof Array)) || dataType === 'object'
                      ? (
                        <EuiFlexItem grow component="span">
                          <EuiFieldText
                            name="newRootKey"
                            value={newRootKey}
                            isInvalid={!!error}
                            placeholder="Enter JSON key"
                            onChange={(event: ChangeEvent) => onChangeSetRootKey(event.target.value)}
                            data-testid="json-key"
                          />
                        </EuiFlexItem>
                      ) : null}
                    <EuiFlexItem grow component="span">
                      <EuiFieldText
                        name="newValue"
                        value={newRootValue as string}
                        placeholder="Enter JSON value"
                        isInvalid={!!error}
                        onChange={(event: ChangeEvent) => onChangeSetRootValue(event.target.value)}
                        data-testid="json-value"
                      />
                    </EuiFlexItem>
                    <div className={cx(styles.controls)}>
                      <EuiButtonIcon
                        iconSize="m"
                        iconType="cross"
                        color="primary"
                        aria-label="Cancel editing"
                        className={styles.declineBtn}
                        onClick={handlerResetAddRootKVPair}
                      />
                      <EuiButtonIcon
                        iconSize="m"
                        iconType="check"
                        color="primary"
                        type="submit"
                        aria-label="Apply"
                        className={styles.applyBtn}
                        data-testid="apply-btn"
                      />
                    </div>
                  </EuiForm>
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
                </EuiFocusTrap>
              </div>

            </EuiOutsideClickDetector>
          </div>
        ) : null}
        <>
          {typeof data === 'object' && data !== null && !(data instanceof Array)
            ? (
              <div className={styles.row}>
                <span>&#125;</span>
                {!addRootKVPair ? (
                  <EuiButtonIcon
                    iconType="plus"
                    className={styles.buttonStyle}
                    onClick={onClickSetRootKVPair}
                    aria-label="Add field"
                    data-testid="add-object-btn"
                  />
                ) : null}
              </div>
            ) : null}
          {data instanceof Array ? (
            <div className={styles.row}>
              {dataType === 'object'
                ? (<span>&#125;</span>)
                : (<span>&#93;</span>)}
              {!addRootKVPair ? (
                <EuiButtonIcon
                  iconType="plus"
                  className={styles.jsonButtonStyle}
                  onClick={onClickSetRootKVPair}
                  aria-label="Add field"
                  data-testid="add-array-btn"
                />
              ) : null}
            </div>
          ) : null}
        </>
      </div>
    </div>
  )
}

function mapDispatch(dispatch: any) {
  return {
    handleFetchVisualisationResults: (path: string, forceRetrieve = false) =>
      dispatch(fetchVisualisationResults(path, forceRetrieve)),
    handleRemoveRejsonKeyAction: (key: string | RedisResponseBuffer, path: string, keyName: string) =>
      dispatch(removeReJSONKeyAction(key, path, keyName)),
    handleAppendRejsonArrayItemAction: (keyName: string, path: string, data: string) =>
      dispatch(appendReJSONArrayItemAction(keyName, path, data)),
    handleSetRejsonDataAction: (keyName: string, path: string, data: string) =>
      dispatch(setReJSONDataAction(keyName, path, data))
  }
}

export default connect(null, mapDispatch)(RejsonDetails)
