import React, { Component, FormEvent } from 'react'
import cx from 'classnames'
import { connect } from 'react-redux'
import {
  EuiButtonIcon,
  EuiFieldText,
  EuiFlexItem,
  EuiFocusTrap,
  EuiForm,
  EuiLoadingSpinner,
  EuiOutsideClickDetector,
  EuiTextArea,
  EuiWindowEvent
} from '@elastic/eui'

import {
  appendReJSONArrayItemAction,
  fetchVisualisationResults,
  setReJSONDataAction
} from 'uiSrc/slices/browser/rejson'
import { bufferToString, createDeleteFieldHeader, createDeleteFieldMessage } from 'uiSrc/utils'

import PopoverDelete from 'uiSrc/pages/browser/components/popover-delete/PopoverDelete'
import FieldMessage from 'uiSrc/components/field-message/FieldMessage'
import {
  JSONArray as TJSONArray,
  IJSONDocument,
  JSONScalarValue,
  REJSONResponse,
  JSONObjectValue,
  JSONArrayValue,
  IJSONObject,
} from '../JSONInterfaces'
import { JSONErrors } from '../constants'
import JSONScalar from '../JSONScalar/JSONScalar'
import JSONObject from '../JSONObject/JSONObject'

import { isScalar } from '../JSONUtils/JSONUtils'
import styles from '../styles.module.scss'

// This interface has been kept empty for now. If any changes is to be made to the body format for updating purpose , the necessary properties will be added here.
interface UpdateValueBody {
}

interface ChangeEvent extends React.ChangeEvent<HTMLInputElement> {}

export interface Props {
  keyName: string | number;
  value: TJSONArray;
  cardinality?: number;
  parentPath: string;
  deleteMsg: string;
  onClickFunc?: (path: string) => void;
  instanceId: number;
  dbNumber: number;
  selectedKey: string;
  leftPadding: string;
  shouldRejsonDataBeDownloaded: boolean;
  handleSubmitUpdateValue?: (body: UpdateValueBody) => void;
  handleDeleteKeyDialogOpen?: () => void;
  handleSubmitJsonUpdateValue: (body: UpdateValueBody) => Promise<void>;
  handleSubmitRemoveKey: (path: string, jsonKeyName: string) => void;
  handleAppendReJSONArrayItemAction: (keyName: string, path: string, data: string) => void;
  handleSetReJSONDataAction: (keyName: string, path: string, data: string) => void;
  handleFetchVisualisationResults: (path: string, forceRetrieve?: boolean) => Promise<any>;
  resultTableKeyMap: {};
  onJSONKeyExpandAndCollapse: (isExpanded: boolean, path: string) => void;
  onJSONPropertyEdited: () => void;
  onJSONPropertyDeleted: () => void;
  onJSONPropertyAdded: () => void;
}

interface State {
  path: string;
  value:
  | JSONArrayValue
  | IJSONObject
  | JSONScalarValue
  | IJSONDocument
  | TJSONArray;
  openIndex: boolean;
  downloaded: boolean;
  editEntireObject: boolean;
  valueOfEntireObject: JSONScalarValue | JSONObjectValue | JSONArrayValue;
  error: string;
  addNewKeyValuePair: boolean;
  newValue: JSONScalarValue | JSONArrayValue | IJSONObject;
  deleting: string;
  loading: boolean;
}

const generatePath = (parentPath: string, currentPath: string) => `${parentPath}['${currentPath}']`

class JSONArrayComponent extends Component<Props, State> {
  constructor(props: Props) {
    super(props)

    const { parentPath, keyName, shouldRejsonDataBeDownloaded } = this.props

    let path = ''
    if (typeof keyName === 'number') {
      path = `${parentPath}[${keyName}]`
    } else {
      path = `${parentPath}['${keyName}']`
    }

    this.state = {
      path,
      value: [],
      openIndex: false,
      downloaded: !shouldRejsonDataBeDownloaded,
      editEntireObject: false,
      valueOfEntireObject: '',
      error: '',
      addNewKeyValuePair: false,
      newValue: '',
      deleting: '',
      loading: false
    }
  }

  handleAppendArrayFormSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    this.setState({
      addNewKeyValuePair: false,
    })
    this.onClickAddNewKVPair()
  }

  handleUpdateValueFormSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    this.setState({
      editEntireObject: false,
    })
    this.onClickSubmitEntireArray()
  }

  handleOnEsc(e: KeyboardEvent, type: string) {
    if (e.code.toLowerCase() === 'escape' || e.keyCode === 27) {
      e.stopPropagation()

      if (type === 'add') {
        this.setState({
          error: '',
          addNewKeyValuePair: false,
        })
      }
      if (type === 'edit') {
        this.setState({
          error: '',
          editEntireObject: false,
        })
      }
    }
  }

  onClickEditEntireObject = () => {
    const { path, editEntireObject } = this.state
    const { handleFetchVisualisationResults } = this.props

    this.setState({
      editEntireObject: !editEntireObject,
    })

    handleFetchVisualisationResults(path, true).then((data: IJSONObject) =>
      this.setState({
        valueOfEntireObject:
          data.data instanceof Array
            ? JSON.stringify(data.data, undefined, 4)
            : data.data,
      }))
  }

  validateJSONValue = (value: any) => {
    let error: string = ''
    try {
      JSON.parse(value as string)
    } catch (e) {
      error = JSONErrors.valueJSONFormat
    }
    return error
  }

  onClickSubmitEntireArray = () => {
    const { path, valueOfEntireObject } = this.state
    const {
      handleSubmitJsonUpdateValue,
      onJSONPropertyEdited,
      handleSetReJSONDataAction,
      selectedKey
    } = this.props

    this.setState({
      editEntireObject: false,
    })

    const body: IJSONObject = {}

    const error: string = this.validateJSONValue(valueOfEntireObject)

    if (error === '') {
      body.path = path
      body.value = valueOfEntireObject as JSONScalarValue
      body.operation = 'update'

      onJSONPropertyEdited()
      handleSubmitJsonUpdateValue(body)
      handleSetReJSONDataAction(selectedKey, path, valueOfEntireObject as string)
    } else {
      this.setState({
        error,
        editEntireObject: true,
      })
    }
  }

  onClickDisableObjectEdit = () => {
    this.setState({
      editEntireObject: false,
    })
  }

  onChangeSetNewValue = (newValue: string) => {
    this.setState({
      newValue,
      error: '',
    })
  }

  onClickSetKVPair = () => {
    const { addNewKeyValuePair } = this.state
    this.setState({
      addNewKeyValuePair: !addNewKeyValuePair,
      newValue: '',
      error: ''
    })
  }

  onChangeSetEntireObjectValue = (objectValue: string) => {
    this.setState({
      valueOfEntireObject: objectValue,
      error: '',
    })
  }

  onClickAddNewKVPair = () => {
    const { newValue, path } = this.state
    const {
      handleSubmitJsonUpdateValue,
      onJSONPropertyAdded,
      handleAppendReJSONArrayItemAction,
      selectedKey
    } = this.props

    this.setState({
      addNewKeyValuePair: false,
    })

    const body: IJSONObject = {}
    let error: string = ''

    if (newValue === undefined || newValue === '') {
      error = 'Value cannot be undefined'
    } else {
      try {
        JSON.parse(newValue as string)
      } catch (e) {
        error = JSONErrors.valueJSONFormat
      }
    }

    if (error === '') {
      body.path = path
      body.operation = 'update'
      body.value = newValue as string
      body.type = 'array'

      onJSONPropertyAdded()

      handleSubmitJsonUpdateValue(body)

      handleAppendReJSONArrayItemAction(selectedKey, path, newValue as string)
      return
    }

    this.setState({
      error,
      addNewKeyValuePair: true,
    })
  }

  onClickFunc = (path: string) => {
    const { openIndex } = this.state
    const { onJSONKeyExpandAndCollapse } = this.props

    // Report Expand and Collapse event
    onJSONKeyExpandAndCollapse(!openIndex, path)

    if (!openIndex) {
      const {
        shouldRejsonDataBeDownloaded,
        handleFetchVisualisationResults,
        value
      } = this.props

      if (!shouldRejsonDataBeDownloaded) {
        this.setState({
          value,
          openIndex: true,
        })
        return
      }

      const spinnerDelay = setTimeout(() => {
        this.setState({ loading: true })
      }, 300)

      handleFetchVisualisationResults(path).then((data: REJSONResponse) =>
        this.setState({
          value: data.data,
          openIndex: true,
          downloaded: data.downloaded,
          loading: false
        }, () => {
          clearTimeout(spinnerDelay)
        }))
      return
    }

    this.setState({
      value: [],
      openIndex: !openIndex,
    })
  }

  mapObject = (data: IJSONObject) => {
    const {
      selectedKey,
      handleSubmitJsonUpdateValue,
      leftPadding,
      deleteMsg,
      handleSubmitUpdateValue,
      dbNumber,
      instanceId,
      resultTableKeyMap,
      onJSONPropertyEdited,
      onJSONPropertyDeleted,
      onJSONPropertyAdded,
      handleSubmitRemoveKey
    } = this.props
    const { path, downloaded } = this.state

    if (data === null) {
      return null
    }
    const keys = Object.keys(data)

    return keys.map((key: string) => (
      <JSONScalar
        resultTableKeyMap={resultTableKeyMap}
        deleteMsg={deleteMsg}
        onJSONPropertyDeleted={onJSONPropertyDeleted}
        onJSONPropertyEdited={onJSONPropertyEdited}
        shouldRejsonDataBeDownloaded={!downloaded}
        key={generatePath(path, key)}
        handleSubmitJsonUpdateValue={handleSubmitJsonUpdateValue}
        parentPath={path}
        keyName={key}
        dbNumber={dbNumber}
        onJSONPropertyAdded={onJSONPropertyAdded}
        instanceId={instanceId}
        value={data[key] as JSONScalarValue}
        leftPadding={String(Number(leftPadding) + 1.5)}
        selectedKey={selectedKey}
        handleSubmitUpdateValue={handleSubmitUpdateValue}
        handleSubmitRemoveKey={handleSubmitRemoveKey}
      />
    ))
  }

  chooseRender = (data: TJSONArray) => {
    const {
      keyName,
      leftPadding,
      deleteMsg,
      selectedKey,
      parentPath,
      dbNumber,
      instanceId,
      handleSubmitUpdateValue,
      resultTableKeyMap,
      handleSubmitJsonUpdateValue,
      onJSONKeyExpandAndCollapse,
      onJSONPropertyEdited,
      onJSONPropertyDeleted,
      onJSONPropertyAdded,
      onClickFunc,
      handleFetchVisualisationResults,
      handleAppendReJSONArrayItemAction,
      handleSetReJSONDataAction,
      handleSubmitRemoveKey
    } = this.props
    const { path, downloaded } = this.state

    if (downloaded) {
      return data.map(
        (
          eachData: JSONScalarValue | JSONArrayValue | IJSONObject,
          i: number
        ) => {
          if (isScalar(eachData as JSONScalarValue)) {
            return (
              <JSONScalar
                resultTableKeyMap={resultTableKeyMap}
                shouldRejsonDataBeDownloaded={false}
                dbNumber={dbNumber}
                deleteMsg={deleteMsg}
                onJSONPropertyDeleted={onJSONPropertyDeleted}
                onJSONPropertyAdded={onJSONPropertyAdded}
                onJSONPropertyEdited={onJSONPropertyEdited}
                instanceId={instanceId}
                handleSubmitJsonUpdateValue={handleSubmitJsonUpdateValue}
                key={generatePath(parentPath, i.toString())}
                parentPath={path}
                keyName={i}
                value={eachData as JSONScalarValue}
                leftPadding={String(Number(leftPadding) + 1.5)}
                selectedKey={selectedKey}
                handleSubmitUpdateValue={handleSubmitUpdateValue}
                handleSubmitRemoveKey={handleSubmitRemoveKey}
              />
            )
          }
          if (typeof eachData === 'object') {
            if (eachData instanceof Array) {
              return (
                <JSONArrayComponent
                  resultTableKeyMap={resultTableKeyMap}
                  shouldRejsonDataBeDownloaded={false}
                  handleFetchVisualisationResults={
                    handleFetchVisualisationResults
                  }
                  handleAppendReJSONArrayItemAction={handleAppendReJSONArrayItemAction}
                  handleSetReJSONDataAction={handleSetReJSONDataAction}
                  key={generatePath(parentPath, i.toString())}
                  parentPath={path}
                  deleteMsg={deleteMsg}
                  keyName={i}
                  onJSONPropertyDeleted={onJSONPropertyDeleted}
                  onJSONPropertyEdited={onJSONPropertyEdited}
                  onJSONKeyExpandAndCollapse={onJSONKeyExpandAndCollapse}
                  onJSONPropertyAdded={onJSONPropertyAdded}
                  dbNumber={dbNumber}
                  instanceId={instanceId}
                  value={eachData}
                  cardinality={(eachData as []).length || 0}
                  handleSubmitJsonUpdateValue={handleSubmitJsonUpdateValue}
                  leftPadding={String(Number(leftPadding) + 1.5)}
                  selectedKey={selectedKey}
                  onClickFunc={onClickFunc}
                  handleSubmitUpdateValue={handleSubmitUpdateValue}
                  handleSubmitRemoveKey={handleSubmitRemoveKey}
                />
              )
            }
            return (
              <JSONObject
                resultTableKeyMap={resultTableKeyMap}
                shouldRejsonDataBeDownloaded={false}
                dbNumber={dbNumber}
                instanceId={instanceId}
                key={generatePath(parentPath, i.toString())}
                onJSONPropertyAdded={onJSONPropertyAdded}
                selectedKey={selectedKey}
                onJSONPropertyEdited={onJSONPropertyEdited}
                handleSubmitJsonUpdateValue={handleSubmitJsonUpdateValue}
                deleteMsg={deleteMsg}
                parentPath={path}
                keyName={i}
                onJSONPropertyDeleted={onJSONPropertyDeleted}
                onJSONKeyExpandAndCollapse={onJSONKeyExpandAndCollapse}
                leftPadding={String(Number(leftPadding) + 1.5)}
                value={eachData as JSONArrayValue}
                cardinality={Object.keys(eachData || {}).length}
                handleSubmitUpdateValue={handleSubmitUpdateValue}
                handleSubmitRemoveKey={handleSubmitRemoveKey}
              />
            )
          }
          return null
        }
      )
    }
    if ((data as TJSONArray).length === 1) {
      return (
        <JSONObject
          resultTableKeyMap={resultTableKeyMap}
          shouldRejsonDataBeDownloaded={!downloaded}
          dbNumber={dbNumber}
          onJSONPropertyDeleted={onJSONPropertyDeleted}
          deleteMsg={deleteMsg}
          instanceId={instanceId}
          onJSONPropertyAdded={onJSONPropertyAdded}
          onJSONPropertyEdited={onJSONPropertyEdited}
          onJSONKeyExpandAndCollapse={onJSONKeyExpandAndCollapse}
          handleSubmitJsonUpdateValue={handleSubmitJsonUpdateValue}
          key={generatePath(parentPath, keyName as string)}
          selectedKey={selectedKey}
          parentPath={path}
          keyName={(data as TJSONArray).length - 1}
          leftPadding={String(Number(leftPadding) + 1.5)}
          value={data as JSONArrayValue}
          cardinality={Object.keys(data || {}).length}
          handleSubmitUpdateValue={handleSubmitUpdateValue}
          handleSubmitRemoveKey={handleSubmitRemoveKey}
        />
      )
    }

    return (data as TJSONArray).map(
      (rawValue: JSONArrayValue | IJSONDocument | IJSONObject, i: number) => {
        if (isScalar(rawValue as JSONScalarValue)) {
          const key = i
          const value = rawValue || JSON.stringify(rawValue)

          return (
            <JSONScalar
              resultTableKeyMap={resultTableKeyMap}
              shouldRejsonDataBeDownloaded={!downloaded}
              dbNumber={dbNumber}
              instanceId={instanceId}
              onJSONPropertyAdded={onJSONPropertyAdded}
              onJSONPropertyDeleted={onJSONPropertyDeleted}
              onJSONPropertyEdited={onJSONPropertyEdited}
              handleSubmitJsonUpdateValue={handleSubmitJsonUpdateValue}
              key={generatePath(parentPath, key.toString())}
              parentPath={path}
              deleteMsg={deleteMsg}
              keyName={key}
              value={value as JSONScalarValue}
              leftPadding={String(Number(leftPadding) + 1.5)}
              selectedKey={selectedKey}
              handleSubmitUpdateValue={handleSubmitUpdateValue}
              handleSubmitRemoveKey={handleSubmitRemoveKey}
            />
          )
        }

        const document = rawValue as IJSONDocument

        const { key, type } = document

        const { value } = document

        if (isScalar(value as JSONScalarValue) || type === 'null') {
          const key = i

          return (
            <JSONScalar
              resultTableKeyMap={resultTableKeyMap}
              shouldRejsonDataBeDownloaded={!downloaded}
              key={generatePath(parentPath, key.toString())}
              parentPath={path}
              onJSONPropertyEdited={onJSONPropertyEdited}
              onJSONPropertyAdded={onJSONPropertyAdded}
              handleSubmitJsonUpdateValue={handleSubmitJsonUpdateValue}
              deleteMsg={deleteMsg}
              dbNumber={dbNumber}
              onJSONPropertyDeleted={onJSONPropertyDeleted}
              instanceId={instanceId}
              keyName={key}
              value={value as JSONScalarValue}
              leftPadding={String(Number(leftPadding) + 1.5)}
              selectedKey={selectedKey}
              handleSubmitUpdateValue={handleSubmitUpdateValue}
              handleSubmitRemoveKey={handleSubmitRemoveKey}
            />
          )
        }

        if (type === 'object') {
          return (
            <JSONObject
              resultTableKeyMap={resultTableKeyMap}
              shouldRejsonDataBeDownloaded={!downloaded}
              dbNumber={dbNumber}
              instanceId={instanceId}
              onJSONKeyExpandAndCollapse={onJSONKeyExpandAndCollapse}
              onJSONPropertyAdded={onJSONPropertyAdded}
              key={generatePath(parentPath, key)}
              selectedKey={selectedKey}
              handleSubmitJsonUpdateValue={handleSubmitJsonUpdateValue}
              parentPath={path}
              onJSONPropertyDeleted={onJSONPropertyDeleted}
              keyName={key}
              onJSONPropertyEdited={onJSONPropertyEdited}
              deleteMsg={deleteMsg}
              leftPadding={String(Number(leftPadding) + 1.5)}
              value={value as JSONArrayValue}
              cardinality={
                  document.cardinality || Object.keys(value || {}).length
                }
              handleSubmitUpdateValue={handleSubmitUpdateValue}
              handleSubmitRemoveKey={handleSubmitRemoveKey}
            />
          )
        }
        if (type === 'array') {
          return (
            <JSONArrayComponent
              resultTableKeyMap={resultTableKeyMap}
              shouldRejsonDataBeDownloaded={!downloaded}
              handleFetchVisualisationResults={
                  handleFetchVisualisationResults
                }
              handleAppendReJSONArrayItemAction={handleAppendReJSONArrayItemAction}
              handleSetReJSONDataAction={handleSetReJSONDataAction}
              key={generatePath(parentPath, key)}
              parentPath={path}
              deleteMsg={deleteMsg}
              onJSONPropertyAdded={onJSONPropertyAdded}
              onJSONPropertyEdited={onJSONPropertyEdited}
              keyName={key}
              onJSONPropertyDeleted={onJSONPropertyDeleted}
              onJSONKeyExpandAndCollapse={onJSONKeyExpandAndCollapse}
              dbNumber={dbNumber}
              instanceId={instanceId}
              handleSubmitJsonUpdateValue={handleSubmitJsonUpdateValue}
              value={[]}
              cardinality={document.cardinality}
              leftPadding={String(Number(leftPadding) + 1.5)}
              selectedKey={selectedKey}
              onClickFunc={onClickFunc}
              handleSubmitUpdateValue={handleSubmitUpdateValue}
              handleSubmitRemoveKey={handleSubmitRemoveKey}
            />
          )
        }

        const simpleObject = rawValue as IJSONObject
        return this.mapObject(simpleObject)
      }
    )
  }

  render() {
    const { keyName, leftPadding, handleSubmitRemoveKey, selectedKey, cardinality } = this.props
    const {
      value,
      path,
      openIndex,
      editEntireObject,
      valueOfEntireObject,
      addNewKeyValuePair,
      newValue,
      deleting,
      loading,
      error
    } = this.state

    return (
      <>
        <div className={styles.row}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              width: '100%'
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                paddingLeft: `${leftPadding}em`
              }}
            >
              <span
                className={cx(styles.quoted, styles.keyName)}
                onClick={() => this.onClickFunc(path)}
                role="presentation"
              >
                {keyName}
              </span>
              <div style={{ paddingLeft: '0.2em', display: 'inline-block' }}>
                :
              </div>

              {!openIndex && !editEntireObject ? (
                <div style={{ display: 'inline-block', cursor: 'pointer' }}>
                  <div
                    className={styles.defaultFont}
                    style={{ paddingLeft: '8px' }}
                    onClick={() => this.onClickFunc(path)}
                    data-testid="expand-array"
                    role="presentation"
                  >
                    &#91;
                    {cardinality ? '...' : ''}
                    &#93;
                  </div>
                </div>
              ) : null}
              {
                openIndex && !editEntireObject
                  ? (
                    <span
                      className={styles.defaultFont}
                      style={{ paddingLeft: '8px' }}
                    >
                      &#91;
                    </span>
                  )
                  : null
              }
            </div>
            <>
              {!editEntireObject && !loading && (
                <div className={styles.actionButtons}>
                  <EuiButtonIcon
                    iconType="documentEdit"
                    className={styles.jsonButtonStyle}
                    onClick={this.onClickEditEntireObject}
                    aria-label="Edit field"
                    color="primary"
                    data-testid="btn-edit-field"
                  />
                  <PopoverDelete
                    header={createDeleteFieldHeader(keyName.toString())}
                    text={createDeleteFieldMessage(bufferToString(selectedKey))}
                    item={keyName.toString()}
                    suffix="array"
                    deleting={deleting}
                    closePopover={() => this.setState({ deleting: '' })}
                    updateLoading={false}
                    showPopover={(item) => {
                      this.setState({ deleting: `${item}array` })
                    }}
                    handleDeleteItem={() => handleSubmitRemoveKey(path, keyName.toString())}
                  />
                </div>
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
          {editEntireObject ? (
            <div className={styles.row}>
              <div style={{
                width: '100%',
                padding: '10px 0'
              }}
              >
                <EuiOutsideClickDetector onOutsideClick={() => {
                  this.setState({
                    editEntireObject: false
                  })
                }}
                >
                  <div style={{ marginBottom: '34px' }}>
                    <EuiWindowEvent event="keydown" handler={(e) => this.handleOnEsc(e, 'edit')} />
                    <EuiFocusTrap>
                      <EuiForm
                        component="form"
                        className="relative"
                        onSubmit={(e) => this.handleUpdateValueFormSubmit(e)}
                        noValidate
                      >
                        <EuiFlexItem grow component="span">
                          <EuiTextArea
                            isInvalid={!!error}
                            style={{ height: '150px', width: '100%', maxWidth: 'none' }}
                            value={
                              valueOfEntireObject ? valueOfEntireObject.toString() : ''
                            }
                            placeholder="Enter JSON value"
                            onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
                              this.onChangeSetEntireObjectValue(event.target.value)}
                            data-testid="json-value"
                          />
                        </EuiFlexItem>
                        <div
                          className={cx(
                            styles.controls,
                            styles.controlsBottom
                          )}
                        >
                          <EuiButtonIcon
                            iconSize="m"
                            iconType="cross"
                            color="primary"
                            aria-label="Cancel add"
                            className={styles.declineBtn}
                            onClick={() => {
                              this.setState({
                                error: '',
                                editEntireObject: false
                              })
                            }}
                          />
                          <EuiButtonIcon
                            iconSize="m"
                            iconType="check"
                            color="primary"
                            type="submit"
                            aria-label="Apply"
                            className={styles.applyBtn}
                            data-testid="apply-edit-btn"
                          />
                        </div>
                      </EuiForm>
                      {error && (
                        <div className={cx(styles.errorMessage, styles.errorMessageForTextArea)}>
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
            </div>
          ) : null}
        </>
        <>
          {!editEntireObject ? (
            <>{value ? this.chooseRender(value as TJSONArray) : '[]'}</>
          ) : null}
          <>
            {addNewKeyValuePair ? (
              <div className={styles.row} style={{ paddingLeft: `${leftPadding}em` }}>
                <EuiOutsideClickDetector onOutsideClick={() => {
                  this.setState({
                    error: '',
                    addNewKeyValuePair: false
                  })
                }}
                >
                  <div>
                    <EuiWindowEvent event="keydown" handler={(e) => this.handleOnEsc(e, 'add')} />
                    <EuiFocusTrap>
                      <EuiForm
                        component="form"
                        className="relative"
                        onSubmit={(e) => this.handleAppendArrayFormSubmit(e)}
                        noValidate
                      >
                        <EuiFlexItem grow component="span">
                          <EuiFieldText
                            isInvalid={!!error}
                            name="newValue"
                            value={newValue as string}
                            placeholder="Enter JSON value"
                            onChange={(event: ChangeEvent) =>
                              this.onChangeSetNewValue(event.target.value)}
                            data-testid="json-value"
                          />
                        </EuiFlexItem>
                        <div
                          className={cx(
                            styles.controls
                          )}
                        >
                          <EuiButtonIcon
                            iconSize="m"
                            iconType="cross"
                            color="primary"
                            aria-label="Cancel editing"
                            className={styles.declineBtn}
                            onClick={() => {
                              this.setState({
                                error: '',
                                addNewKeyValuePair: false
                              })
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
            {openIndex && !editEntireObject ? (
              <div
                className={styles.row}
                style={{ paddingLeft: `${leftPadding}em` }}
              >
                <span className={styles.defaultFont}>&#93;</span>
                <EuiButtonIcon
                  iconType="plus"
                  className={styles.jsonButtonStyle}
                  onClick={this.onClickSetKVPair}
                  aria-label="Add field"
                  data-testid="add-field-btn"
                />
              </div>
            ) : null}
          </>
        </>
      </>
    )
  }
}

function mapDispatch(dispatch: any) {
  return {
    handleFetchVisualisationResults: (path: string, forceRetrieve = false) =>
      dispatch(fetchVisualisationResults(path, forceRetrieve)),
    handleAppendReJSONArrayItemAction: (keyName: string, path: string, data: string) =>
      dispatch(appendReJSONArrayItemAction(keyName, path, data)),
    handleSetReJSONDataAction: (keyName: string, path: string, data: string) =>
      dispatch(setReJSONDataAction(keyName, path, data))
  }
}

export default connect(null, mapDispatch)(JSONArrayComponent)
