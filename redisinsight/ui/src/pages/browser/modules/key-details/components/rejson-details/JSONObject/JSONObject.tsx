import React, { ChangeEvent, FormEvent } from 'react'
import {
  EuiButtonIcon,
  EuiFieldText,
  EuiFlexItem,
  EuiFocusTrap,
  EuiForm,
  EuiLoadingSpinner,
  EuiOutsideClickDetector,
  EuiText,
  EuiTextArea,
  EuiWindowEvent
} from '@elastic/eui'
import { connect } from 'react-redux'
import cx from 'classnames'

import { fetchVisualisationResults, setReJSONDataAction } from 'uiSrc/slices/browser/rejson'
import { bufferToString, createDeleteFieldHeader, createDeleteFieldMessage } from 'uiSrc/utils'

import PopoverDelete from 'uiSrc/pages/browser/components/popover-delete/PopoverDelete'
import FieldMessage from 'uiSrc/components/field-message/FieldMessage'
import {
  IJSONObject,
  JSONScalarValue,
  JSONArrayValue,
  JSONArray,
  JSONObjectValue,
  IJSONDocument,
  REJSONResponse,
} from '../JSONInterfaces'
import { JSONErrors } from '../constants'
import { isScalar, generatePath } from '../JSONUtils/JSONUtils'
import JSONScalar from '../JSONScalar/JSONScalar'
import JSONArrayComponent from '../JSONArray/JSONArray'

import styles from '../styles.module.scss'

// This interface has been kept empty for now. If any changes is to be made to the body format for updating purpose , the necessary properties will be added here.
interface UpdateValueBody {
}

export interface Props {
  keyName: string | number;
  value: JSONArrayValue | IJSONObject | JSONScalarValue;
  cardinality?: number;
  parentPath: string;
  selectedKey: string;
  instanceId: number;
  dbNumber: number;
  leftPadding: string;
  deleteMsg: string;
  shouldRejsonDataBeDownloaded: boolean;
  handleSubmitUpdateValue?: (body: UpdateValueBody) => void;
  handleSubmitJsonUpdateValue: (body: UpdateValueBody) => Promise<void>;
  handleSubmitRemoveKey: (path: string, jsonKeyName: string) => void;
  handleSetReJSONDataAction: (keyName: string, path: string, data: string) => void;
  handleFetchVisualisationResults: (path: string, forceRetrieve?: boolean) => Promise<any>;
  handleDeleteKeyDialogOpen?: () => void;
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
  | JSONArrayValue[];
  openIndex: boolean;
  downloaded: boolean;
  addNewKeyValuePair: boolean;
  newKey: string | undefined;
  newValue: JSONScalarValue | JSONArrayValue | IJSONObject;
  error: string;
  editEntireObject: boolean;
  valueOfEntireObject: JSONScalarValue | JSONObjectValue | JSONArrayValue;
  deleting: string;
  loading: boolean;
}

const MAX_LEFT_PADDING_NESTING = 8

class JSONObject extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    const { keyName, parentPath, shouldRejsonDataBeDownloaded } = this.props

    let path = ''
    if (typeof keyName === 'number') {
      path = `${parentPath}[${keyName}]`
    } else {
      path = keyName.includes('"') ? `${parentPath}['${keyName}']` : `${parentPath}["${keyName}"]`
    }

    this.state = {
      path,
      value: [],
      openIndex: false,
      downloaded: !shouldRejsonDataBeDownloaded,
      addNewKeyValuePair: false,
      newKey: '',
      newValue: '',
      error: '',
      editEntireObject: false,
      valueOfEntireObject: '',
      deleting: '',
      loading: false
    }
    this.handlerResetAddNewKeyValuePair = this.handlerResetAddNewKeyValuePair.bind(this)
  }

  handleFormSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    this.onClickAddNewKVPair()
  }

  handlerResetAddNewKeyValuePair() {
    this.setState({
      error: '',
      addNewKeyValuePair: false,
      newKey: '',
      newValue: '',
    })
  }

  handleUpdateValueFormSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    this.setState({
      editEntireObject: false,
    })
    this.onClickSubmitEntireObject()
  }

  handleOnEsc(e: KeyboardEvent, type: string) {
    if (e.code.toLowerCase() === 'escape' || e.keyCode === 27) {
      e.stopPropagation()

      if (type === 'add') {
        this.handlerResetAddNewKeyValuePair()
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
          typeof data.data === 'object'
            ? JSON.stringify(data.data, undefined, 4)
            : data.data,
      }))
  }

  onClickSubmitEntireObject = () => {
    const { path, valueOfEntireObject } = this.state
    const {
      handleSubmitJsonUpdateValue,
      onJSONPropertyEdited,
      selectedKey,
      handleSetReJSONDataAction
    } = this.props

    const error: string = this.validateJSONValue(valueOfEntireObject)

    this.setState({
      editEntireObject: false,
    })

    if (error === '') {
      const body: IJSONObject = {}

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

  onClickSetKVPair = () => {
    const { addNewKeyValuePair } = this.state
    this.setState({
      addNewKeyValuePair: !addNewKeyValuePair,
      newKey: '',
      newValue: '',
    })
  }

  onChangeSetNewKey = (newKey: string) => {
    this.setState({
      newKey,
      error: '',
    })
  }

  onChangeSetNewValue = (newValue: string) => {
    this.setState({
      newValue,
      error: '',
    })
  }

  onClickDisableObjectEdit = () => {
    this.setState({
      editEntireObject: false,
    })
  }

  onChangeSetEntireObjectValue = (objectValue: string) => {
    this.setState({
      valueOfEntireObject: objectValue,
      error: '',
    })
  }

  onClickAddNewKVPair = () => {
    const { newKey, newValue, path } = this.state
    const {
      handleSubmitJsonUpdateValue,
      handleSetReJSONDataAction,
      selectedKey,
      onJSONPropertyAdded
    } = this.props

    const body: IJSONObject = {}
    let error: string = ''

    this.setState({
      addNewKeyValuePair: false,
    })

    error = this.validateKeyValue()

    if (error === '') {
      body.previous_path = path
      body.new_key = newKey as string
      body.path = `${path}[${newKey}]`
      body.operation = 'update'
      body.value = newValue as string

      onJSONPropertyAdded()

      handleSubmitJsonUpdateValue(body)
      const unescapedKey = JSON.parse(newKey as string)
      const updatedPath = unescapedKey.includes('"') ? `${path}['${unescapedKey}']` : `${path}["${unescapedKey}"]`
      handleSetReJSONDataAction(selectedKey, updatedPath, newValue as string)
    } else {
      this.setState({
        error,
        addNewKeyValuePair: true,
      })
    }
  }

  onClickFunc = (path: string) => {
    const { openIndex } = this.state
    const {
      onJSONKeyExpandAndCollapse,
      handleFetchVisualisationResults,
    } = this.props
    // Report Expand and Collapse event
    onJSONKeyExpandAndCollapse(!openIndex, path)

    if (!openIndex) {
      const { shouldRejsonDataBeDownloaded, value } = this.props

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

  validateJSONValue = (value: any) => {
    let error: string = ''
    try {
      JSON.parse(value as string)
    } catch (e) {
      error = JSONErrors.valueJSONFormat
    }
    return error
  }

  validateKeyValue = (): string => {
    const { newKey, newValue } = this.state
    if (newKey === undefined || newKey === '') {
      return JSONErrors.keyCorrectSyntax
    }
    if (!newKey.startsWith('"') || !newKey.endsWith('"')) {
      return JSONErrors.keyCorrectSyntax
    }
    try {
      const unescapedKey = JSON.parse(newKey as string)
      if (unescapedKey.includes('"') && unescapedKey.includes("'")) {
        return JSONErrors.keyCorrectSyntax
      }
    } catch (e) {
      return JSONErrors.keyCorrectSyntax
    }
    try {
      JSON.parse(newValue as string)
    } catch (e) {
      return JSONErrors.valueJSONFormat
    }
    return ''
  }

  mapObjectValues = (data: JSONArray) => {
    const {
      parentPath,
      selectedKey,
      handleSubmitJsonUpdateValue,
      leftPadding,
      dbNumber,
      instanceId,
      deleteMsg,
      handleSubmitUpdateValue,
      resultTableKeyMap,
      onJSONKeyExpandAndCollapse,
      onJSONPropertyEdited,
      onJSONPropertyDeleted,
      onJSONPropertyAdded,
      handleFetchVisualisationResults,
      handleSubmitRemoveKey,
      handleSetReJSONDataAction
    } = this.props
    const { path, downloaded } = this.state

    if (data === null || data.length === 0) return null

    return (data as JSONArray).map(
      (rawvalue: IJSONDocument | JSONArrayValue, i: number) => {
        if (isScalar(rawvalue as JSONScalarValue)) {
          const key = i
          const value = rawvalue || JSON.stringify(rawvalue)

          return (
            <JSONScalar
              deleteMsg={deleteMsg}
              resultTableKeyMap={resultTableKeyMap}
              shouldRejsonDataBeDownloaded={!downloaded}
              instanceId={instanceId}
              dbNumber={dbNumber}
              onJSONPropertyAdded={onJSONPropertyAdded}
              onJSONPropertyDeleted={onJSONPropertyDeleted}
              onJSONPropertyEdited={onJSONPropertyEdited}
              handleSubmitJsonUpdateValue={handleSubmitJsonUpdateValue}
              key={generatePath(parentPath, key.toString())}
              parentPath={path}
              keyName={key}
              value={value as JSONScalarValue}
              leftPadding={this.calculateLeftPadding(leftPadding)}
              selectedKey={selectedKey}
              handleSubmitUpdateValue={handleSubmitUpdateValue}
              handleSubmitRemoveKey={handleSubmitRemoveKey}
            />
          )
        }

        const doc = rawvalue as IJSONDocument

        const { key } = doc

        const { value } = doc

        const valueType = doc.type

        if (value === null && valueType === 'null') {
          return (
            <JSONScalar
              resultTableKeyMap={resultTableKeyMap}
              shouldRejsonDataBeDownloaded={!downloaded}
              instanceId={instanceId}
              onJSONPropertyEdited={onJSONPropertyEdited}
              dbNumber={dbNumber}
              onJSONPropertyAdded={onJSONPropertyAdded}
              handleSubmitJsonUpdateValue={handleSubmitJsonUpdateValue}
              deleteMsg={deleteMsg}
              onJSONPropertyDeleted={onJSONPropertyDeleted}
              key={generatePath(parentPath, key)}
              parentPath={path}
              keyName={key}
              value={value}
              leftPadding={this.calculateLeftPadding(leftPadding)}
              selectedKey={selectedKey}
              handleSubmitUpdateValue={handleSubmitUpdateValue}
              handleSubmitRemoveKey={handleSubmitRemoveKey}
            />
          )
        }
        if (valueType !== 'object' && valueType !== 'array') {
          return (
            <JSONScalar
              resultTableKeyMap={resultTableKeyMap}
              shouldRejsonDataBeDownloaded={!downloaded}
              dbNumber={dbNumber}
              instanceId={instanceId}
              key={generatePath(parentPath, key)}
              parentPath={path}
              onJSONPropertyEdited={onJSONPropertyEdited}
              keyName={key}
              onJSONPropertyAdded={onJSONPropertyAdded}
              handleSubmitJsonUpdateValue={handleSubmitJsonUpdateValue}
              deleteMsg={deleteMsg}
              onJSONPropertyDeleted={onJSONPropertyDeleted}
              value={value as JSONScalarValue}
              selectedKey={selectedKey}
              leftPadding={this.calculateLeftPadding(leftPadding)}
              handleSubmitUpdateValue={handleSubmitUpdateValue}
              handleSubmitRemoveKey={handleSubmitRemoveKey}
            />
          )
        }
        if (valueType === 'array') {
          return (
            <JSONArrayComponent
              resultTableKeyMap={resultTableKeyMap}
              shouldRejsonDataBeDownloaded={!downloaded}
              key={generatePath(parentPath, key)}
              parentPath={path}
              keyName={key}
              onJSONPropertyAdded={onJSONPropertyAdded}
              onJSONPropertyEdited={onJSONPropertyEdited}
              dbNumber={dbNumber}
              onJSONPropertyDeleted={onJSONPropertyDeleted}
              handleSubmitJsonUpdateValue={handleSubmitJsonUpdateValue}
              instanceId={instanceId}
              deleteMsg={deleteMsg}
              value={[]}
              cardinality={doc.cardinality || 0}
              onJSONKeyExpandAndCollapse={onJSONKeyExpandAndCollapse}
              leftPadding={this.calculateLeftPadding(leftPadding)}
              selectedKey={selectedKey}
              handleSubmitUpdateValue={handleSubmitUpdateValue}
              handleSubmitRemoveKey={handleSubmitRemoveKey}
            />
          )
        }
        return (
          <JSONObject
            resultTableKeyMap={resultTableKeyMap}
            shouldRejsonDataBeDownloaded={!downloaded}
            handleFetchVisualisationResults={
                      handleFetchVisualisationResults
                    }
            dbNumber={dbNumber}
            instanceId={instanceId}
            deleteMsg={deleteMsg}
            onJSONPropertyAdded={onJSONPropertyAdded}
            onJSONPropertyDeleted={onJSONPropertyDeleted}
            onJSONKeyExpandAndCollapse={onJSONKeyExpandAndCollapse}
            handleSubmitJsonUpdateValue={handleSubmitJsonUpdateValue}
            key={generatePath(parentPath, doc.key)}
            selectedKey={selectedKey}
            parentPath={path}
            onJSONPropertyEdited={onJSONPropertyEdited}
            keyName={key}
            leftPadding={this.calculateLeftPadding(leftPadding)}
            value={value as JSONArrayValue}
            cardinality={
                      doc.cardinality || Object.keys(value || {}).length
                    }
            handleSubmitUpdateValue={handleSubmitUpdateValue}
            handleSubmitRemoveKey={handleSubmitRemoveKey}
            handleSetReJSONDataAction={handleSetReJSONDataAction}
          />
        )
      }
    )
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
      onJSONKeyExpandAndCollapse,
      onJSONPropertyEdited,
      onJSONPropertyDeleted,
      onJSONPropertyAdded,
      handleFetchVisualisationResults,
      handleSubmitRemoveKey,
      handleSetReJSONDataAction,
      parentPath,
    } = this.props
    const { path, downloaded } = this.state

    if (data === null) {
      return null
    }
    const keys = Object.keys(data)

    return keys.map((key: string) => {
      if (isScalar(data[key] as JSONScalarValue) || data[key] === null) {
        return (
          <JSONScalar
            resultTableKeyMap={resultTableKeyMap}
            handleSubmitJsonUpdateValue={handleSubmitJsonUpdateValue}
            shouldRejsonDataBeDownloaded={!downloaded}
            key={generatePath(path, key)}
            onJSONPropertyAdded={onJSONPropertyAdded}
            deleteMsg={deleteMsg}
            onJSONPropertyDeleted={onJSONPropertyDeleted}
            onJSONPropertyEdited={onJSONPropertyEdited}
            parentPath={path}
            dbNumber={dbNumber}
            instanceId={instanceId}
            keyName={key}
            value={data[key] as JSONScalarValue}
            leftPadding={this.calculateLeftPadding(leftPadding)}
            selectedKey={selectedKey}
            handleSubmitUpdateValue={handleSubmitUpdateValue}
            handleSubmitRemoveKey={handleSubmitRemoveKey}
          />
        )
      }
      if (data[key] instanceof Array) {
        return (
          <JSONArrayComponent
            resultTableKeyMap={resultTableKeyMap}
            shouldRejsonDataBeDownloaded={!downloaded}
            key={generatePath(parentPath, key)}
            parentPath={path}
            keyName={key}
            onJSONPropertyAdded={onJSONPropertyAdded}
            onJSONPropertyDeleted={onJSONPropertyDeleted}
            handleSubmitJsonUpdateValue={handleSubmitJsonUpdateValue}
            dbNumber={dbNumber}
            deleteMsg={deleteMsg}
            onJSONPropertyEdited={onJSONPropertyEdited}
            onJSONKeyExpandAndCollapse={onJSONKeyExpandAndCollapse}
            instanceId={instanceId}
            value={data[key] as JSONArrayValue[]}
            cardinality={(data[key] as JSONArrayValue[]).length || 0}
            leftPadding={this.calculateLeftPadding(leftPadding)}
            selectedKey={selectedKey}
            handleSubmitUpdateValue={handleSubmitUpdateValue}
            handleSubmitRemoveKey={handleSubmitRemoveKey}
          />
        )
      }
      return (
        <JSONObject
          resultTableKeyMap={resultTableKeyMap}
          shouldRejsonDataBeDownloaded={!downloaded}
          dbNumber={dbNumber}
          instanceId={instanceId}
          onJSONPropertyDeleted={onJSONPropertyDeleted}
          key={generatePath(parentPath, key)}
          selectedKey={selectedKey}
          onJSONPropertyAdded={onJSONPropertyAdded}
          onJSONPropertyEdited={onJSONPropertyEdited}
          parentPath={path}
          handleSubmitJsonUpdateValue={handleSubmitJsonUpdateValue}
          keyName={key}
          deleteMsg={deleteMsg}
          handleFetchVisualisationResults={handleFetchVisualisationResults}
          onJSONKeyExpandAndCollapse={onJSONKeyExpandAndCollapse}
          leftPadding={this.calculateLeftPadding(leftPadding)}
          value={data[key] as JSONArrayValue}
          cardinality={Object.keys(data[key] || {}).length}
          handleSubmitUpdateValue={handleSubmitUpdateValue}
          handleSubmitRemoveKey={handleSubmitRemoveKey}
          handleSetReJSONDataAction={handleSetReJSONDataAction}
        />
      )
    })
  }

  chooseRender = (data: JSONArray | IJSONObject, isArray: boolean) => {
    if (isArray) {
      return this.mapObjectValues(data as JSONArray)
    }
    return this.mapObject(data as IJSONObject)
  }

  calculateLeftPadding(leftPadding: string) {
    return String(Number(leftPadding) + (Number(leftPadding) / 1.5 <= MAX_LEFT_PADDING_NESTING ? 1.5 : 0))
  }

  render() {
    const { keyName, parentPath, leftPadding, handleSubmitRemoveKey, selectedKey, cardinality } = this.props

    const {
      value,
      openIndex,
      addNewKeyValuePair,
      newKey,
      newValue,
      path,
      editEntireObject,
      valueOfEntireObject,
      deleting,
      loading,
      error
    } = this.state

    const { onClickFunc } = this

    return (
      <>
        <div
          className={styles.row}
          key={keyName + parentPath}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              width: '100%',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'flex-end'
              }}
            >
              <EuiText
                style={{ paddingLeft: `${leftPadding}em` }}
              >

                <div style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'flex-end'
                }}
                >
                  <span
                    className={cx(styles.quoted, styles.keyName)}
                    onClick={() => onClickFunc(path)}
                    role="presentation"
                  >
                    {keyName}
                  </span>
                  <EuiText
                    style={{ paddingLeft: '0.2em', display: 'inline-block' }}
                  >
                    :
                  </EuiText>
                  {!openIndex && !editEntireObject ? (
                    <EuiText style={{ display: 'inline-block' }}>
                      <div
                        className={styles.defaultFont}
                        style={{ paddingLeft: '8px' }}
                        onClick={() => this.onClickFunc(path)}
                        data-testid="expand-object"
                        role="presentation"
                      >
                        &#123;
                        {cardinality ? '...' : ''}
                        &#125;
                      </div>
                    </EuiText>
                  ) : null}
                </div>
              </EuiText>

              {openIndex && !editEntireObject ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignSelf: 'flex-end' }}>
                  <EuiText>

                    <span
                      className={styles.defaultFont}
                      style={{ paddingLeft: '8px' }}
                    >
                      &#123;
                    </span>
                  </EuiText>
                </div>
              ) : null}
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
                    data-testid="edit-object-btn"
                  />
                  <PopoverDelete
                    header={createDeleteFieldHeader(keyName.toString())}
                    text={createDeleteFieldMessage(bufferToString(selectedKey))}
                    item={keyName.toString()}
                    suffix="object"
                    deleting={deleting}
                    closePopover={() => this.setState({ deleting: '' })}
                    updateLoading={false}
                    showPopover={(item) => {
                      this.setState({ deleting: `${item}object` })
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
          {editEntireObject && (
            <div className={styles.row}>
              <div style={{
                width: '100%',
                padding: '10px 0'
              }}
              >
                <EuiOutsideClickDetector onOutsideClick={() => {
                  this.setState({
                    error: '',
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
                            onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
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
          )}
        </>
        {!editEntireObject ? (
          <>
            {value
              ? this.chooseRender(
                value as JSONArray | IJSONObject,
                value instanceof Array
              )
              : '{}'}
          </>
        ) : null}
        <>
          {addNewKeyValuePair ? (
            <div className={styles.row} style={{ paddingLeft: `${leftPadding}em` }}>

              <EuiOutsideClickDetector onOutsideClick={this.handlerResetAddNewKeyValuePair}>
                <div>
                  <EuiWindowEvent event="keydown" handler={(e) => this.handleOnEsc(e, 'add')} />
                  <EuiFocusTrap>
                    <EuiForm
                      component="form"
                      className="relative"
                      onSubmit={(e) => this.handleFormSubmit(e)}
                      style={{ display: 'flex' }}
                      noValidate
                    >
                      <EuiFlexItem grow component="span">
                        <EuiFieldText
                          name="newRootKey"
                          isInvalid={!!error}
                          value={newKey}
                          placeholder="Enter JSON key"
                          onChange={(event: ChangeEvent) =>
                            this.onChangeSetNewKey(event.target.value)}
                          data-testid="json-key"
                        />
                      </EuiFlexItem>
                      <EuiFlexItem grow component="span">
                        <EuiFieldText
                          name="newValue"
                          isInvalid={!!error}
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
                          onClick={this.handlerResetAddNewKeyValuePair}
                        />
                        <EuiButtonIcon
                          iconSize="m"
                          iconType="check"
                          color="primary"
                          type="submit"
                          aria-label="Apply"
                          className={styles.applyBtn}
                          // disabled={!!this.validateKeyValue()}
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
              <EuiText>
                <span className={styles.defaultFont}>&#125;</span>
                <EuiButtonIcon
                  iconType="plus"
                  className={styles.buttonStyle}
                  onClick={this.onClickSetKVPair}
                  aria-label="Add field"
                  data-testid="add-field-btn"
                />
              </EuiText>
            </div>
          ) : null}
        </>
      </>
    )
  }
}

function mapDispatch(dispatch: any) {
  return {
    handleFetchVisualisationResults: (path: string, forceRetrieve = false) =>
      dispatch(fetchVisualisationResults(path, forceRetrieve)),
    handleSetReJSONDataAction: (keyName: string, path: string, data: string) =>
      dispatch(setReJSONDataAction(keyName, path, data))
  }
}

export default connect(null, mapDispatch)(JSONObject)
