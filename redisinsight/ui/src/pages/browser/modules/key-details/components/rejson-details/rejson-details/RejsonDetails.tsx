import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { EuiButtonIcon } from '@elastic/eui'
import {
  appendReJSONArrayItemAction,
  fetchVisualisationResults,
  removeReJSONKeyAction,
  setReJSONDataAction
} from 'uiSrc/slices/browser/rejson'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'

import { getBrackets, isRealArray, isRealObject, wrapPath } from '../utils'
import { BaseProps, ObjectTypes } from '../interfaces'
import RejsonDynamicTypes from '../rejson-dynamic-types'
import { AddItem } from '../components'

import styles from '../styles.module.scss'

const RejsonDetails = (props: BaseProps) => {
  const {
    data,
    selectedKey,
    length,
    dataType,
    parentPath,
    isDownloaded,
    onJsonKeyExpandAndCollapse,
    expadedRows
  } = props

  const [addRootKVPair, setAddRootKVPair] = useState<boolean>(false)

  const dispatch = useDispatch()

  const handleFetchVisualisationResults = (path: string, forceRetrieve = false) =>
    dispatch<any>(fetchVisualisationResults(path, forceRetrieve))

  const handleAppendRejsonArrayItemAction = (keyName: RedisResponseBuffer, path: string, data: string) => {
    dispatch(appendReJSONArrayItemAction(keyName, path, data, length))
  }

  const handleSetRejsonDataAction = (keyName: RedisResponseBuffer, path: string, data: string) => {
    dispatch(setReJSONDataAction(keyName, path, data, length))
  }

  const handleFormSubmit = ({ key, value }: { key?: string, value: string }) => {
    setAddRootKVPair(false)
    if (isRealArray(data, dataType)) {
      handleAppendRejsonArrayItemAction(selectedKey, '.', value)
      return
    }

    const updatedPath = wrapPath(key as string)
    if (updatedPath) {
      handleSetRejsonDataAction(selectedKey, updatedPath, value)
    }
  }

  const onClickRemoveKey = (path: string, keyName: string) => {
    dispatch(removeReJSONKeyAction(selectedKey, path || '.', keyName, length))
  }

  const onClickSetRootKVPair = () => {
    setAddRootKVPair(!addRootKVPair)
  }

  const isObject = isRealObject(data, dataType)
  const isArray = isRealArray(data, dataType)

  return (
    <div className={styles.jsonData} id="jsonData" data-testid="json-data">
      <>
        {(isObject || isArray) && (
          <div className={styles.row}>
            <span>{getBrackets(isObject ? ObjectTypes.Object : ObjectTypes.Array, 'start')}</span>
          </div>
        )}
        <RejsonDynamicTypes
          data={data}
          parentPath={parentPath}
          selectedKey={selectedKey}
          isDownloaded={isDownloaded}
          expadedRows={expadedRows}
          onClickRemoveKey={onClickRemoveKey}
          onJsonKeyExpandAndCollapse={onJsonKeyExpandAndCollapse}
          handleAppendRejsonObjectItemAction={handleAppendRejsonArrayItemAction}
          handleSetRejsonDataAction={handleSetRejsonDataAction}
          handleFetchVisualisationResults={handleFetchVisualisationResults}
        />
        {addRootKVPair && (
          <AddItem
            isPair={isObject}
            onCancel={() => setAddRootKVPair(false)}
            onSubmit={handleFormSubmit}
          />
        )}
        {(isObject || isArray) && (
          <div className={styles.row}>
            <span>{getBrackets(isObject ? ObjectTypes.Object : ObjectTypes.Array, 'end')}</span>
            {!addRootKVPair && (
              <EuiButtonIcon
                iconType="plus"
                className={styles.buttonStyle}
                onClick={onClickSetRootKVPair}
                aria-label="Add field"
                data-testid={isObject ? 'add-object-btn' : 'add-array-btn'}
              />
            )}
          </div>
        )}
      </>
    </div>
  )
}

export default RejsonDetails
