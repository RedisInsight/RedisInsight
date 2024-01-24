import React, { FormEvent, useEffect, useState } from 'react'
import cx from 'classnames'
import {
  EuiButtonIcon,
  EuiFieldText,
  EuiFlexItem,
  EuiFocusTrap,
  EuiForm,
  EuiLoadingSpinner,
  EuiOutsideClickDetector,
  EuiWindowEvent
} from '@elastic/eui'

import FieldMessage from 'uiSrc/components/field-message/FieldMessage'
import {
  REJSONResponse,
  IJSONObject,
  IJSONValue,
  JSONArrayProps,
  ChangeEvent,
} from 'uiSrc/pages/browser/modules/key-details/components/rejson-details/interfaces'
import { RejsonDynamicTypes } from 'uiSrc/pages/browser/modules/key-details/components/rejson-details/rejson-dynamic-types'
import {
  generatePath,
  validateRejsonValue
} from 'uiSrc/pages/browser/modules/key-details/components/rejson-details/utils'
import { JSONErrors } from 'uiSrc/pages/browser/modules/key-details/components/rejson-details/constants'

import {
  EditEntireItemAction,
  AddItemFieldAction, EditItemFieldAction
} from 'uiSrc/pages/browser/modules/key-details/components/rejson-details/rejson-details-actions'
import styles from '../styles.module.scss'

const RejsonArrayComponent = (props: JSONArrayProps) => {
  const {
    parentPath,
    keyName,
    shouldRejsonDataBeDownloaded,
    leftPadding,
    selectedKey,
    cardinality = 0,
    handleSubmitRemoveKey,
    onClickRemoveKey,
    handleSubmitJsonUpdateValue,
    handleSubmitUpdateValue,
    onJsonKeyExpandAndCollapse,
    handleFetchVisualisationResults,
    handleAppendRejsonArrayItemAction,
    handleSetRejsonDataAction,
    path: currentFullPath,
    value: currentValue,
  } = props

  const [path] = useState<string>(currentFullPath || generatePath(parentPath, keyName))
  const [value, setValue] = useState<any>([])
  const [openIndex, setOpenIndex] = useState<boolean>(false)
  const [downloaded, setDownloaded] = useState<boolean>(!shouldRejsonDataBeDownloaded)
  const [editEntireArray, setEditEntireArray] = useState<boolean>(false)
  const [valueOfEntireArray, setValueOfEntireArray] = useState<any>('')
  const [addNewKeyValuePair, setAddNewKeyValuePair] = useState<boolean>(false)
  const [newValue, setNewValue] = useState<IJSONValue>('')
  const [deleting, setDeleting] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setError(null)
  }, [newValue, valueOfEntireArray])

  const handleAppendArrayFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setAddNewKeyValuePair(false)
    onClickAddNewKVPair()
  }

  const handleUpdateValueFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setEditEntireArray(false)
    onClickSubmitEntireArray()
  }

  const handleOnEsc = (e: KeyboardEvent, type: string) => {
    if (e.code.toLowerCase() === 'escape' || e.keyCode === 27) {
      e.stopPropagation()
      setError(null)

      if (type === 'add') setAddNewKeyValuePair(false)
      if (type === 'edit') setEditEntireArray(false)
    }
  }

  const onClickEditEntireArray = () => {
    setEditEntireArray(!editEntireArray)

    if (!editEntireArray) {
      handleFetchVisualisationResults(path, true).then((data: REJSONResponse) => {
        setValueOfEntireArray(data.data instanceof Array ? JSON.stringify(data.data, undefined, 4) : data.data)
      })
    }
  }

  const onClickSubmitEntireArray = () => {
    setEditEntireArray(false)
    const error: string | null = validateRejsonValue(valueOfEntireArray)

    if (error) {
      setError(error)
      setEditEntireArray(true)
      return
    }

    const body: IJSONObject = {
      path,
      value: valueOfEntireArray,
      operation: 'update'
    }

    handleSubmitJsonUpdateValue(body)
    handleSetRejsonDataAction(selectedKey, path, valueOfEntireArray as string)
  }

  const onClickSetKVPair = () => {
    setAddNewKeyValuePair(!addNewKeyValuePair)
    setNewValue('')
    setError(null)
  }

  const onClickAddNewKVPair = () => {
    setAddNewKeyValuePair(false)

    let error = null
    if (newValue === undefined || newValue === '') {
      error = 'Value cannot be undefined'
    } else {
      try {
        JSON.parse(newValue as string)
      } catch (e) {
        error = JSONErrors.valueJSONFormat
      }
    }

    if (error) {
      setAddNewKeyValuePair(true)
      setError(error)
      return
    }

    const body: IJSONObject = {
      path,
      operation: 'update',
      value: newValue,
      type: 'array'
    }

    handleSubmitJsonUpdateValue(body)
    handleAppendRejsonArrayItemAction(selectedKey, path, newValue as string)
  }

  const onClickFunc = (path: string) => {
    // Report Expand and Collapse event
    onJsonKeyExpandAndCollapse(!openIndex, path)

    if (!openIndex) {
      if (!shouldRejsonDataBeDownloaded) {
        setValue(currentValue)
        setOpenIndex(true)
        return
      }

      const spinnerDelay = setTimeout(() => setLoading(true), 300)
      handleFetchVisualisationResults(path)
        .then((data) => {
          setValue(data.data)
          setOpenIndex(true)
          setDownloaded(data.downloaded)
          setLoading(false)
        })
        .catch(() => {
          clearTimeout(spinnerDelay)
        })

      return
    }

    setValue([])
    setOpenIndex(!openIndex)
  }

  return (
    <>
      <div className={styles.row} key={keyName + parentPath}>
        <div className={styles.rowContainer}>
          <div className={styles.quotedKeyName} style={{ paddingLeft: `${leftPadding}em` }}>
            <span
              className={cx(styles.quoted, styles.keyName)}
              onClick={() => onClickFunc(path)}
              role="presentation"
            >
              {keyName}
            </span>
            <div style={{ paddingLeft: '0.2em', display: 'inline-block' }}>:</div>
            {!openIndex && !editEntireArray ? (
              <div
                className={styles.defaultFontExpandArray}
                onClick={() => onClickFunc(path)}
                data-testid="expand-array"
                role="presentation"
              >
                &#91;
                {cardinality ? '...' : ''}
                &#93;
              </div>
            ) : null}
            {openIndex && !editEntireArray ? <span className={styles.defaultFontOpenIndex}>&#91;</span> : null}
          </div>
          <>
            {!editEntireArray && !loading && (
              <EditItemFieldAction
                type="array"
                keyName={keyName.toString()}
                selectedKey={selectedKey}
                path={path}
                deleting={deleting}
                setDeleting={setDeleting}
                handleSubmitRemoveKey={handleSubmitRemoveKey}
                onClickEditEntireItem={onClickEditEntireArray}
              />
            )}
          </>
          <>
            {loading && (
              <div className={styles.actionButtons} style={{ justifyContent: 'flex-end' }}>
                <div className={styles.spinner}>
                  <EuiLoadingSpinner size="m" />
                </div>
              </div>
            )}
          </>
        </div>
      </div>
      <>
        {editEntireArray ? (
          <EditEntireItemAction
            error={error}
            setError={setError}
            handleOnEsc={handleOnEsc}
            handleUpdateValueFormSubmit={handleUpdateValueFormSubmit}
            valueOfEntireItem={valueOfEntireArray}
            setValueOfEntireItem={setValueOfEntireArray}
            setEditEntireItem={setEditEntireArray}
          />
        ) : null}
      </>
      <>
        {!editEntireArray ? (
          <>{value ? (
            <RejsonDynamicTypes
              data={value}
              selectedKey={selectedKey}
              onClickRemoveKey={onClickRemoveKey}
              handleSubmitJsonUpdateValue={handleSubmitJsonUpdateValue}
              shouldRejsonDataBeDownloaded={!downloaded}
              onJsonKeyExpandAndCollapse={onJsonKeyExpandAndCollapse}
              handleSubmitUpdateValue={handleSubmitUpdateValue}
              parentPath={path}
              onClickFunc={onClickFunc}
              handleFetchVisualisationResults={handleFetchVisualisationResults}
              handleAppendRejsonArrayItemAction={handleAppendRejsonArrayItemAction}
              handleSetRejsonDataAction={handleSetRejsonDataAction}
            />
          ) : '[]'}
          </>
        ) : null}
        <>
          {addNewKeyValuePair ? (
            <div className={styles.row} style={{ paddingLeft: `${leftPadding}em` }}>
              <EuiOutsideClickDetector onOutsideClick={() => {
                setError(null)
                setAddNewKeyValuePair(false)
              }}
              >
                <div>
                  <EuiWindowEvent event="keydown" handler={(e) => handleOnEsc(e, 'add')} />
                  <EuiFocusTrap>
                    <EuiForm
                      component="form"
                      className="relative"
                      onSubmit={(e) => handleAppendArrayFormSubmit(e)}
                      noValidate
                    >
                      <EuiFlexItem grow component="span">
                        <EuiFieldText
                          isInvalid={!!error}
                          name="newValue"
                          value={newValue as string}
                          placeholder="Enter JSON value"
                          onChange={(event: ChangeEvent) => setNewValue(event.target.value)}
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
                          onClick={() => {
                            setError(null)
                            setAddNewKeyValuePair(false)
                          }}
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
        </>
        <>
          {openIndex && !editEntireArray ? (
            <AddItemFieldAction
              leftPadding={leftPadding}
              type="array"
              onClickSetKVPair={onClickSetKVPair}
            />
          ) : null}
        </>
      </>
    </>
  )
}

export default RejsonArrayComponent
