import React from 'react'

import { isNull, isObject } from 'lodash'
import { MAX_LEFT_PADDING_NESTING } from '../constants'
import { DynamicTypesProps, ObjectTypes } from '../interfaces'
import { generatePath, isScalar } from '../utils'

import RejsonScalar from '../rejson-scalar'
import RejsonObject from '../rejson-object'

const RejsonDynamicTypes = (props: DynamicTypesProps) => {
  const {
    data,
    selectedKey,
    parentPath = '',
    isDownloaded,
    expandedRows,
    leftPadding = 0,
    onClickRemoveKey,
    onJsonKeyExpandAndCollapse,
    handleSubmitUpdateValue,
    handleFetchVisualisationResults,
    handleAppendRejsonObjectItemAction,
    handleSetRejsonDataAction,
  } = props

  const nextLeftPadding = Math.min(leftPadding + 1, MAX_LEFT_PADDING_NESTING)

  const renderScalar = (data: any) => (
    <RejsonScalar
      isRoot={isNull(data.key) && data.parentPath === '.'}
      leftPadding={nextLeftPadding}
      selectedKey={selectedKey}
      path={data.path}
      parentPath={data.parentPath}
      keyName={data.key}
      key={generatePath(data.parentPath, data.key)}
      value={data.value}
      handleSubmitRemoveKey={(path: string, keyName: string) => onClickRemoveKey(path, keyName)}
    />
  )

  const renderJSONObject = (data: any, type: string) => (
    <RejsonObject
      expandedRows={expandedRows}
      type={type as ObjectTypes}
      isDownloaded={isDownloaded}
      leftPadding={nextLeftPadding}
      selectedKey={selectedKey}
      path={data.path}
      parentPath={data.parentPath}
      key={generatePath(data.parentPath, data.key)}
      keyName={data.key}
      onJsonKeyExpandAndCollapse={onJsonKeyExpandAndCollapse}
      value={data.value || {}}
      cardinality={data.cardinality}
      handleSubmitRemoveKey={(path: string, keyName: string) => onClickRemoveKey(path, keyName)}
      onClickRemoveKey={onClickRemoveKey}
      handleSubmitUpdateValue={handleSubmitUpdateValue}
      handleSetRejsonDataAction={handleSetRejsonDataAction}
      handleFetchVisualisationResults={handleFetchVisualisationResults}
      handleAppendRejsonObjectItemAction={handleAppendRejsonObjectItemAction}
    />
  )

  const renderRejsonDataBeDownloaded = (item: any, i: number) => {
    console.log('renderRejsonDataBeDownloaded', 1, item)
    if (isScalar(item)) return renderScalar({ key: i || null, value: item, parentPath })

    console.log('renderRejsonDataBeDownloaded', 2, item)
    const data = { ...item, parentPath }
    if (['array', 'object'].includes(item.type)) return renderJSONObject(data, item.type)

    console.log('renderRejsonDataBeDownloaded', 3, data)
    return renderScalar(data)
  }

  const renderArrayItem = (key: string | number, value: any) => {
    // it is the same to render object or array
    if (isObject(value)) {
      return renderJSONObject({
        key,
        value,
        cardinality: Object.keys(value).length,
        parentPath,
      }, Array.isArray(value) ? ObjectTypes.Array : ObjectTypes.Object)
    }

    return renderScalar({ key, value, parentPath })
  }

  const renderResult = (data: any) => {
    console.log('renderResult', 1, data)
    if (isScalar(data)) {
      return renderScalar({ key: null, value: data, parentPath })
    }

    console.log('renderResult', 2, data)
    if (!isDownloaded) {
      return data?.map(renderRejsonDataBeDownloaded)
    }

    console.log('renderResult', 3, data)
    if (Array.isArray(data)) {
      return data?.map((item, i) => renderArrayItem(i, item))
    }
    console.log('renderResult', 4, data)
    return Object.entries(data).map(([key, value]) => renderArrayItem(key, value))
  }

  return renderResult(data)
}

export default RejsonDynamicTypes
