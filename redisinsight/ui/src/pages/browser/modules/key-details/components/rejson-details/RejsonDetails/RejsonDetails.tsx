import React, { FormEvent } from 'react'
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
  removeReJSONKeyAction,
  setReJSONDataAction
} from 'uiSrc/slices/browser/rejson'
import FieldMessage from 'uiSrc/components/field-message/FieldMessage'
import { bufferToString } from 'uiSrc/utils'
import { JSONErrors } from '../constants'
import JSONScalar from '../JSONScalar/JSONScalar'
import JSONObject from '../JSONObject/JSONObject'
import JSONArrayComponent from '../JSONArray/JSONArray'
import { isScalar } from '../JSONUtils/JSONUtils'

import {
  IJSONObject,
  JSONArrayValue,
  JSONArray as TJSONArray,
  IJSONDocument,
  JSONScalarValue,
} from '../JSONInterfaces'
import styles from '../styles.module.scss'

interface ChangeEvent extends React.ChangeEvent<HTMLInputElement> {
}

export interface Props {
  data: JSONArrayValue | IJSONDocument | IJSONDocument[];
  path?: string;
  dataType: string;
  selectedKey: string;
  instanceId: number;
  dbNumber: number;
  keyProperty: any;
  shouldRejsonDataBeDownloaded: boolean;
  leftPadding?: string;
  handleOpenExpiryDialog: () => void;
  handleDeleteKeyDialogOpen: () => void;
  handleSubmitUpdateValue: (body: any) => void;
  handleSubmitJsonUpdateValue: (body: any) => Promise<void>;
  handleRemoveReJSONKeyAction: (key: string, path: string, jsonKeyName: string) => Promise<any>;
  handleAppendReJSONArrayItemAction: (keyName: string, path: string, data: string) => void;
  handleSetReJSONDataAction: (keyName: string, path: string, data: string) => void;
  resultTableKeyMap: {};
  deleteMsg: string;
  onJSONKeyExpandAndCollapse: (isExpanded: boolean, path: string) => void;
  onJSONPropertyEdited: () => void;
  onJSONPropertyDeleted: () => void;
  onJSONPropertyAdded: () => void;
}

interface State {
  path: string | undefined;
  addRootKVPair: boolean;
  newRootKey: string | undefined;
  newRootValue: JSONScalarValue | JSONArrayValue | IJSONObject;
  error: string;
}

class RejsonDetails extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      path: '',
      addRootKVPair: false,
      newRootKey: '',
      newRootValue: '',
      error: '',
    }
    this.handlerResetAddRootKVPair = this.handlerResetAddRootKVPair.bind(this)
  }

  handleFormSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    this.onClickSubmitRootKVPair()
  }

  handlerResetAddRootKVPair() {
    this.setState({
      error: '',
      addRootKVPair: false,
      newRootKey: '',
      newRootValue: '',
    })
  }

  handleOnEsc(e: KeyboardEvent) {
    if (e.code.toLowerCase() === 'escape' || e.keyCode === 27) {
      e.stopPropagation()
      this.handlerResetAddRootKVPair()
    }
  }

  onClickRemoveKey = (path: string, jsonKeyName: string) => {
    const {
      handleSubmitJsonUpdateValue,
      onJSONPropertyDeleted,
      handleRemoveReJSONKeyAction,
      selectedKey
    } = this.props

    onJSONPropertyDeleted()

    const body: IJSONObject = {}

    body.operation = 'remove'
    body.path = path

    handleSubmitJsonUpdateValue(body)
    handleRemoveReJSONKeyAction(selectedKey, path || '.', jsonKeyName)
  }

  onClickSetRootKVPair = () => {
    const { addRootKVPair } = this.state
    this.setState({
      addRootKVPair: !addRootKVPair,
    })
  }

  onChangeSetRootKey = (newRootKey: string) => {
    this.setState({
      newRootKey,
      error: ''
    })
  }

  onChangeSetRootValue = (
    value: JSONScalarValue | JSONArrayValue | IJSONObject
  ) => {
    this.setState({
      newRootValue: value || '',
      error: ''
    })
  }

  validateRootKVPair = (): string => {
    const { newRootKey, newRootValue } = this.state
    const {
      shouldRejsonDataBeDownloaded,
      data,
      dataType
    } = this.props
    if (
      (shouldRejsonDataBeDownloaded && dataType === 'object')
      || (!shouldRejsonDataBeDownloaded && !(data instanceof Array))
    ) {
      if (newRootKey === undefined || newRootKey === '') {
        return JSONErrors.keyCorrectSyntax
      }
      if (!newRootKey.startsWith('"') || !newRootKey.endsWith('"')) {
        return JSONErrors.keyCorrectSyntax
      }
      try {
        const unescapedKey = JSON.parse(newRootKey as string)
        if (unescapedKey.includes('"') && unescapedKey.includes("'")) {
          return JSONErrors.keyCorrectSyntax
        }
      } catch (e) {
        return JSONErrors.keyCorrectSyntax
      }
      try {
        JSON.parse(newRootValue as string)
      } catch (e) {
        return JSONErrors.valueJSONFormat
      }
      return ''
    }
    try {
      JSON.parse(newRootValue as string)
      return ''
    } catch (e) {
      return JSONErrors.valueJSONFormat
    }
  }

  onClickSubmitRootKVPair = () => {
    const { newRootKey, newRootValue, path } = this.state
    const {
      data,
      handleSubmitJsonUpdateValue,
      onJSONPropertyAdded,
      handleAppendReJSONArrayItemAction,
      selectedKey,
      handleSetReJSONDataAction,
      dataType
    } = this.props

    this.setState({
      addRootKVPair: false,
    })

    const body: IJSONObject = {}
    const error: string = this.validateRootKVPair()

    if (error === '') {
      let updatedPath

      body.operation = 'update'
      body.value = newRootValue as string
      body.previous_path = path as string
      body.new_key = newRootKey as string

      if (data instanceof Array && dataType !== 'object') {
        body.type = 'array'
        body.path = '.'

        handleAppendReJSONArrayItemAction(selectedKey, '.', newRootValue as string)
      } else {
        const unescapedKey = JSON.parse(newRootKey as string)
        updatedPath = unescapedKey.includes('"') ? `['${unescapedKey}']` : `["${unescapedKey}"]`
        body.path = updatedPath

        handleSetReJSONDataAction(selectedKey, updatedPath, newRootValue as string)
      }
      onJSONPropertyAdded()
      handleSubmitJsonUpdateValue(body)
    } else {
      this.setState({
        error,
        addRootKVPair: true,
      })
    }
  }

  renderResultArray(data: TJSONArray | JSONScalarValue) {
    const {
      selectedKey,
      dbNumber,
      instanceId,
      handleSubmitUpdateValue,
      resultTableKeyMap,
      shouldRejsonDataBeDownloaded,
      deleteMsg,
      handleSubmitJsonUpdateValue,
      onJSONKeyExpandAndCollapse,
      onJSONPropertyEdited,
      onJSONPropertyDeleted,
      onJSONPropertyAdded
    } = this.props

    if (!shouldRejsonDataBeDownloaded) {
      if (isScalar(data as JSONScalarValue)) {
        return (
          <JSONScalar
            bigString
            shouldRejsonDataBeDownloaded={shouldRejsonDataBeDownloaded}
            instanceId={instanceId}
            dbNumber={dbNumber}
            resultTableKeyMap={resultTableKeyMap}
            leftPadding="1"
            handleSubmitJsonUpdateValue={handleSubmitJsonUpdateValue}
            selectedKey={selectedKey}
            deleteMsg={deleteMsg}
            onJSONPropertyEdited={onJSONPropertyEdited}
            parentPath=""
            keyName={bufferToString(selectedKey)}
            onJSONPropertyDeleted={onJSONPropertyDeleted}
            onJSONPropertyAdded={onJSONPropertyAdded}
            value={data as JSONScalarValue}
            handleSubmitUpdateValue={handleSubmitUpdateValue}
            handleSubmitRemoveKey={(path, jsonKeyName) => this.onClickRemoveKey(path, jsonKeyName)}
          />
        )
      }
      if (data instanceof Array) {
        return data.map(
          (eachEntry: IJSONObject | JSONArrayValue, i: number) => {
            if (isScalar(eachEntry as JSONScalarValue)) {
              return (
                <JSONScalar
                  resultTableKeyMap={resultTableKeyMap}
                  shouldRejsonDataBeDownloaded={shouldRejsonDataBeDownloaded}
                  instanceId={instanceId}
                  deleteMsg={deleteMsg}
                  onJSONPropertyEdited={onJSONPropertyEdited}
                  dbNumber={dbNumber}
                  onJSONPropertyAdded={onJSONPropertyAdded}
                  leftPadding="1"
                  onJSONPropertyDeleted={onJSONPropertyDeleted}
                  handleSubmitJsonUpdateValue={handleSubmitJsonUpdateValue}
                  selectedKey={selectedKey}
                  parentPath=""
                  keyName={i}
                  /* eslint-disable-next-line react/no-array-index-key */
                  key={i}
                  value={eachEntry as JSONScalarValue}
                  handleSubmitUpdateValue={handleSubmitUpdateValue}
                  handleSubmitRemoveKey={(path, jsonKeyName) => this.onClickRemoveKey(path, jsonKeyName)}
                />
              )
            }

            if (eachEntry instanceof Array) {
              return (
                <JSONArrayComponent
                  resultTableKeyMap={resultTableKeyMap}
                  shouldRejsonDataBeDownloaded={shouldRejsonDataBeDownloaded}
                  /* eslint-disable-next-line react/no-array-index-key */
                  key={i}
                  handleSubmitJsonUpdateValue={handleSubmitJsonUpdateValue}
                  parentPath=""
                  deleteMsg={deleteMsg}
                  onJSONPropertyAdded={onJSONPropertyAdded}
                  onJSONPropertyDeleted={onJSONPropertyDeleted}
                  keyName={i}
                  onJSONKeyExpandAndCollapse={onJSONKeyExpandAndCollapse}
                  onJSONPropertyEdited={onJSONPropertyEdited}
                  dbNumber={dbNumber}
                  instanceId={instanceId}
                  value={eachEntry}
                  cardinality={(eachEntry || []).length}
                  leftPadding="1"
                  selectedKey={selectedKey}
                  handleSubmitUpdateValue={handleSubmitUpdateValue}
                  handleSubmitRemoveKey={(path, jsonKeyName) => this.onClickRemoveKey(path, jsonKeyName)}
                />
              )
            }
            return (
              <JSONObject
                resultTableKeyMap={resultTableKeyMap}
                shouldRejsonDataBeDownloaded={shouldRejsonDataBeDownloaded}
                leftPadding="1"
                instanceId={instanceId}
                dbNumber={dbNumber}
                handleSubmitJsonUpdateValue={handleSubmitJsonUpdateValue}
                deleteMsg={deleteMsg}
                onJSONPropertyDeleted={onJSONPropertyDeleted}
                selectedKey={selectedKey}
                onJSONPropertyEdited={onJSONPropertyEdited}
                onJSONPropertyAdded={onJSONPropertyAdded}
                parentPath=""
                keyName={i}
                /* eslint-disable-next-line react/no-array-index-key */
                key={i}
                onJSONKeyExpandAndCollapse={onJSONKeyExpandAndCollapse}
                value={eachEntry}
                cardinality={Object.keys(eachEntry || {}).length}
                handleSubmitUpdateValue={handleSubmitUpdateValue}
                handleSubmitRemoveKey={(path, jsonKeyName) => this.onClickRemoveKey(path, jsonKeyName)}
              />
            )
          }
        )
      }
      if (data !== null && typeof data === 'object') {
        const objectKeys = Object.keys(data)
        return objectKeys.map((key: string) => {
          if (isScalar(data[key])) {
            return (
              <JSONScalar
                resultTableKeyMap={resultTableKeyMap}
                shouldRejsonDataBeDownloaded={shouldRejsonDataBeDownloaded}
                instanceId={instanceId}
                dbNumber={dbNumber}
                deleteMsg={deleteMsg}
                leftPadding="1"
                onJSONPropertyAdded={onJSONPropertyAdded}
                handleSubmitJsonUpdateValue={handleSubmitJsonUpdateValue}
                selectedKey={selectedKey}
                onJSONPropertyDeleted={onJSONPropertyDeleted}
                parentPath=""
                onJSONPropertyEdited={onJSONPropertyEdited}
                keyName={key}
                key={key as string}
                value={data[key] as JSONScalarValue}
                handleSubmitUpdateValue={handleSubmitUpdateValue}
                handleSubmitRemoveKey={(path, jsonKeyName) => this.onClickRemoveKey(path, jsonKeyName)}
              />
            )
          }
          if ((data[key] as JSONArrayValue) instanceof Array) {
            return (
              <JSONArrayComponent
                resultTableKeyMap={resultTableKeyMap}
                shouldRejsonDataBeDownloaded={shouldRejsonDataBeDownloaded}
                key={key as string}
                parentPath=""
                onJSONKeyExpandAndCollapse={onJSONKeyExpandAndCollapse}
                keyName={key}
                onJSONPropertyEdited={onJSONPropertyEdited}
                dbNumber={dbNumber}
                onJSONPropertyAdded={onJSONPropertyAdded}
                deleteMsg={deleteMsg}
                instanceId={instanceId}
                onJSONPropertyDeleted={onJSONPropertyDeleted}
                value={data[key]}
                cardinality={((data[key] as []) || []).length}
                leftPadding="1"
                handleSubmitJsonUpdateValue={handleSubmitJsonUpdateValue}
                selectedKey={selectedKey}
                handleSubmitUpdateValue={handleSubmitUpdateValue}
                handleSubmitRemoveKey={(path, jsonKeyName) => this.onClickRemoveKey(path, jsonKeyName)}
              />
            )
          }
          if (data[key] === null) {
            return (
              <JSONScalar
                resultTableKeyMap={resultTableKeyMap}
                shouldRejsonDataBeDownloaded={shouldRejsonDataBeDownloaded}
                instanceId={instanceId}
                dbNumber={dbNumber}
                leftPadding="1"
                onJSONPropertyAdded={onJSONPropertyAdded}
                onJSONPropertyDeleted={onJSONPropertyDeleted}
                selectedKey={selectedKey}
                parentPath=""
                handleSubmitJsonUpdateValue={handleSubmitJsonUpdateValue}
                keyName={key}
                key={key as string}
                onJSONPropertyEdited={onJSONPropertyEdited}
                deleteMsg={deleteMsg}
                value={data[key] as JSONScalarValue}
                handleSubmitUpdateValue={handleSubmitUpdateValue}
                handleSubmitRemoveKey={(path, jsonKeyName) => this.onClickRemoveKey(path, jsonKeyName)}
              />
            )
          }
          return (
            <JSONObject
              resultTableKeyMap={resultTableKeyMap}
              shouldRejsonDataBeDownloaded={shouldRejsonDataBeDownloaded}
              leftPadding="1"
              instanceId={instanceId}
              dbNumber={dbNumber}
              onJSONPropertyEdited={onJSONPropertyEdited}
              onJSONPropertyAdded={onJSONPropertyAdded}
              selectedKey={selectedKey}
              onJSONPropertyDeleted={onJSONPropertyDeleted}
              parentPath=""
              keyName={key}
              key={key as string}
              deleteMsg={deleteMsg}
              onJSONKeyExpandAndCollapse={onJSONKeyExpandAndCollapse}
              handleSubmitJsonUpdateValue={handleSubmitJsonUpdateValue}
              value={data[key] as JSONArrayValue}
              cardinality={Object.keys(data[key] || {}).length}
              handleSubmitUpdateValue={handleSubmitUpdateValue}
              handleSubmitRemoveKey={(path, jsonKeyName) => this.onClickRemoveKey(path, jsonKeyName)}
            />
          )
        })
      }
      return null
    }
    if (isScalar(data as JSONScalarValue)) {
      return (
        <JSONScalar
          resultTableKeyMap={resultTableKeyMap}
          shouldRejsonDataBeDownloaded={shouldRejsonDataBeDownloaded}
          bigString
          leftPadding="1"
          onJSONPropertyAdded={onJSONPropertyAdded}
          handleSubmitJsonUpdateValue={handleSubmitJsonUpdateValue}
          selectedKey={selectedKey}
          parentPath=""
          dbNumber={dbNumber}
          onJSONPropertyDeleted={onJSONPropertyDeleted}
          deleteMsg={deleteMsg}
          onJSONPropertyEdited={onJSONPropertyEdited}
          instanceId={instanceId}
          keyName={bufferToString(selectedKey)}
          value={data as JSONScalarValue}
          handleSubmitUpdateValue={handleSubmitUpdateValue}
          handleSubmitRemoveKey={(path, jsonKeyName) => this.onClickRemoveKey(path, jsonKeyName)}
        />
      )
    }

    return (data as TJSONArray).map(
      (rawValue: JSONArrayValue | IJSONDocument) => {
        const document = rawValue as IJSONDocument

        const { key, type } = document
        const { value } = document

        if (isScalar(value as JSONScalarValue) || type === 'null') {
          return (
            <JSONScalar
              resultTableKeyMap={resultTableKeyMap}
              shouldRejsonDataBeDownloaded={shouldRejsonDataBeDownloaded}
              instanceId={instanceId}
              dbNumber={dbNumber}
              leftPadding="1"
              onJSONPropertyAdded={onJSONPropertyAdded}
              onJSONPropertyDeleted={onJSONPropertyDeleted}
              onJSONPropertyEdited={onJSONPropertyEdited}
              selectedKey={selectedKey}
              deleteMsg={deleteMsg}
              parentPath=""
              keyName={key}
              key={key}
              handleSubmitJsonUpdateValue={handleSubmitJsonUpdateValue}
              value={value as JSONScalarValue}
              handleSubmitUpdateValue={handleSubmitUpdateValue}
              handleSubmitRemoveKey={(path, jsonKeyName) => this.onClickRemoveKey(path, jsonKeyName)}
            />
          )
        }
        if (type === 'array') {
          return (
            <JSONArrayComponent
              resultTableKeyMap={resultTableKeyMap}
              shouldRejsonDataBeDownloaded={shouldRejsonDataBeDownloaded}
              key={key as string}
              parentPath=""
              keyName={key}
              dbNumber={dbNumber}
              onJSONPropertyAdded={onJSONPropertyAdded}
              onJSONPropertyEdited={onJSONPropertyEdited}
              instanceId={instanceId}
              onJSONPropertyDeleted={onJSONPropertyDeleted}
              value={[]}
              cardinality={(rawValue as IJSONDocument).cardinality || 0}
              onJSONKeyExpandAndCollapse={onJSONKeyExpandAndCollapse}
              handleSubmitJsonUpdateValue={handleSubmitJsonUpdateValue}
              deleteMsg={deleteMsg}
              leftPadding="1"
              selectedKey={selectedKey}
              handleSubmitUpdateValue={handleSubmitUpdateValue}
              handleSubmitRemoveKey={(path, jsonKeyName) => this.onClickRemoveKey(path, jsonKeyName)}
            />
          )
        }

        return (
          <JSONObject
            resultTableKeyMap={resultTableKeyMap}
            shouldRejsonDataBeDownloaded={shouldRejsonDataBeDownloaded}
            leftPadding="1"
            instanceId={instanceId}
            dbNumber={dbNumber}
            selectedKey={selectedKey}
            onJSONPropertyAdded={onJSONPropertyAdded}
            onJSONPropertyDeleted={onJSONPropertyDeleted}
            handleSubmitJsonUpdateValue={handleSubmitJsonUpdateValue}
            parentPath=""
            onJSONPropertyEdited={onJSONPropertyEdited}
            deleteMsg={deleteMsg}
            keyName={key}
            key={key}
            value={[] as JSONArrayValue}
            cardinality={document.cardinality || 0}
            onJSONKeyExpandAndCollapse={onJSONKeyExpandAndCollapse}
            handleSubmitUpdateValue={handleSubmitUpdateValue}
            handleSubmitRemoveKey={(path, jsonKeyName) => this.onClickRemoveKey(path, jsonKeyName)}
          />
        )
      }
    )
  }

  render() {
    const {
      shouldRejsonDataBeDownloaded,
      handleSubmitJsonUpdateValue,
      data,
      instanceId,
      selectedKey,
      dbNumber,
      deleteMsg,
      resultTableKeyMap,
      handleSubmitUpdateValue,
      onJSONPropertyEdited,
      onJSONPropertyDeleted,
      onJSONPropertyAdded,
      dataType
    } = this.props
    const { addRootKVPair, newRootKey, newRootValue, error } = this.state

    return (
      <div className={styles.jsonData} id="jsonData" data-testid="json-data">
        <div>
          {typeof data === 'object'
          && data !== null
          && !(data instanceof Array) ? (
            <div className={styles.row}>
              <span>&#123;</span>
            </div>
            ) : null}
          {data instanceof Array && (
            dataType === 'object' ? (
              <div className={styles.row}><span>&#123;</span></div>
            ) : (
              <div className={styles.row}><span>&#91;</span></div>
            )
          )}
          <>
            {data ? (
              this.renderResultArray(data as string)
            ) : (
              <JSONScalar
                resultTableKeyMap={resultTableKeyMap}
                shouldRejsonDataBeDownloaded={shouldRejsonDataBeDownloaded}
                bigString
                instanceId={instanceId}
                onJSONPropertyDeleted={onJSONPropertyDeleted}
                dbNumber={dbNumber}
                handleSubmitJsonUpdateValue={handleSubmitJsonUpdateValue}
                leftPadding="1"
                selectedKey={selectedKey}
                deleteMsg={deleteMsg}
                onJSONPropertyAdded={onJSONPropertyAdded}
                parentPath=""
                onJSONPropertyEdited={onJSONPropertyEdited}
                keyName={bufferToString(selectedKey)}
                value={data as JSONScalarValue}
                handleSubmitUpdateValue={handleSubmitUpdateValue}
                handleSubmitRemoveKey={(path, jsonKeyName) => this.onClickRemoveKey(path, jsonKeyName)}
              />
            )}
          </>
          {addRootKVPair ? (
            <div className={styles.row} style={{ display: 'flex', flexDirection: 'row' }}>
              <EuiOutsideClickDetector onOutsideClick={this.handlerResetAddRootKVPair}>
                <div>
                  <EuiWindowEvent event="keydown" handler={(e) => this.handleOnEsc(e)} />
                  <EuiFocusTrap>
                    <EuiForm
                      component="form"
                      className="relative"
                      onSubmit={(e) => this.handleFormSubmit(e)}
                      style={{ display: 'flex' }}
                      noValidate
                    >
                      {(typeof data === 'object'
                          && data !== null
                          && !(data instanceof Array)) || dataType === 'object' ? (
                            <EuiFlexItem grow component="span">
                              <EuiFieldText
                                name="newRootKey"
                                value={newRootKey}
                                isInvalid={!!error}
                                placeholder="Enter JSON key"
                                onChange={(event: ChangeEvent) =>
                                  this.onChangeSetRootKey(event.target.value)}
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
                          onChange={(event: ChangeEvent) =>
                            this.onChangeSetRootValue(event.target.value)}
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
                          onClick={this.handlerResetAddRootKVPair}
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
            {typeof data === 'object'
            && data !== null
            && !(data instanceof Array) ? (
              <div className={styles.row}>
                <span>&#125;</span>
                {!addRootKVPair ? (
                  <EuiButtonIcon
                    iconType="plus"
                    className={styles.buttonStyle}
                    onClick={this.onClickSetRootKVPair}
                    aria-label="Add field"
                    data-testid="add-object-btn"
                  />
                ) : null}
              </div>
              ) : null}
            {data instanceof Array ? (
              <div className={styles.row}>
                {dataType === 'object' ? (
                  <span>&#125;</span>
                ) : (
                  <span>&#93;</span>
                )}
                {!addRootKVPair ? (
                  <EuiButtonIcon
                    iconType="plus"
                    className={styles.jsonButtonStyle}
                    onClick={this.onClickSetRootKVPair}
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
}

function mapDispatch(dispatch: any) {
  return {
    handleRemoveReJSONKeyAction: (key: string, path: string, jsonKeyName: string) =>
      dispatch(removeReJSONKeyAction(key, path, jsonKeyName)),
    handleAppendReJSONArrayItemAction: (keyName: string, path: string, data: string) =>
      dispatch(appendReJSONArrayItemAction(keyName, path, data)),
    handleSetReJSONDataAction: (keyName: string, path: string, data: string) =>
      dispatch(setReJSONDataAction(keyName, path, data))
  }
}

export default connect(null, mapDispatch)(RejsonDetails)
