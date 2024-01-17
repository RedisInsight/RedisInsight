import React from 'react'
import RejsonScalar from 'uiSrc/pages/browser/modules/key-details/components/rejson-details/rejson-scalar/RejsonScalar'
import {
  generatePath,
  isScalar
} from 'uiSrc/pages/browser/modules/key-details/components/rejson-details/utils'
import RejsonArray from 'uiSrc/pages/browser/modules/key-details/components/rejson-details/rejson-array/RejsonArray'
import RejsonObject from 'uiSrc/pages/browser/modules/key-details/components/rejson-details/rejson-object/RejsonObject'
import { DynamicTypesProps } from 'uiSrc/pages/browser/modules/key-details/components/rejson-details/interfaces'
import { MIN_LEFT_PADDING_NESTING } from 'uiSrc/pages/browser/modules/key-details/components/rejson-details/constants'

const RejsonDynamicTypes = (props: DynamicTypesProps) => {
  const {
    data,
    selectedKey,
    parentPath = '',
    shouldRejsonDataBeDownloaded,
    onClickRemoveKey,
    onJsonKeyExpandAndCollapse,
    handleSubmitJsonUpdateValue,
    handleSubmitUpdateValue,
    handleFetchVisualisationResults,
    handleAppendRejsonArrayItemAction,
    handleSetRejsonDataAction,
  } = props

  const countBracketedElements = (input: string) => (input.match(/\]/g) || []).length

  const calculateLeftPadding = (parentPath: string) =>
    String(MIN_LEFT_PADDING_NESTING + (parentPath ? countBracketedElements(parentPath) * 1.5 : 0))

  const renderScalar = (data) =>
    (
      <RejsonScalar
        leftPadding={calculateLeftPadding(data.parentPath)}
        selectedKey={selectedKey}
        path={data.path}
        parentPath={data.parentPath}
        keyName={data.key}
        key={generatePath(data.parentPath, data.key)}
        value={data.value}
        handleSubmitRemoveKey={(path: string, keyName: string) => onClickRemoveKey(path, keyName)}
        handleSubmitJsonUpdateValue={handleSubmitJsonUpdateValue}
      />
    )

  const renderJSONArray = (data) =>
    (
      <RejsonArray
        shouldRejsonDataBeDownloaded={shouldRejsonDataBeDownloaded}
        key={generatePath(data.parentPath, data.key)}
        handleSubmitJsonUpdateValue={handleSubmitJsonUpdateValue}
        path={data.path}
        parentPath={data.parentPath}
        keyName={data.key}
        onJsonKeyExpandAndCollapse={onJsonKeyExpandAndCollapse}
        value={data.value || []}
        cardinality={data.cardinality}
        leftPadding={calculateLeftPadding(data.parentPath)}
        selectedKey={selectedKey}
        handleSubmitUpdateValue={handleSubmitUpdateValue}
        handleSubmitRemoveKey={(path: string, keyName: string) => onClickRemoveKey(path, keyName)}
        onClickRemoveKey={onClickRemoveKey}
        handleFetchVisualisationResults={handleFetchVisualisationResults}
        handleAppendRejsonArrayItemAction={handleAppendRejsonArrayItemAction}
        handleSetRejsonDataAction={handleSetRejsonDataAction}
      />
    )

  const renderJSONObject = (data) =>
    (
      <RejsonObject
        shouldRejsonDataBeDownloaded={shouldRejsonDataBeDownloaded}
        leftPadding={calculateLeftPadding(data.parentPath)}
        handleSubmitJsonUpdateValue={handleSubmitJsonUpdateValue}
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
        handleAppendRejsonArrayItemAction={handleAppendRejsonArrayItemAction}
      />
    )

  const renderRejsonDataBeDownloaded = (item, i: number) => {
    if (isScalar(item)) return renderScalar({ key: i || null, value: item, parentPath })

    const data = { ...item, parentPath }
    if (item.type === 'array') return renderJSONArray(data)
    if (item.type === 'object') return renderJSONObject(data)
    return renderScalar(data)
  }

  const renderArrayItem = ([key, value], i: number) => {
    if (Array.isArray(value)) {
      return renderJSONArray({
        key,
        value,
        cardinality: value.length,
        parentPath
      })
    }
    if (typeof value === 'object') {
      return renderJSONObject({
        key,
        value,
        cardinality: Object.keys(value).length,
        parentPath
      })
    }
    return renderScalar({ key: key || i, value, parentPath })
  }

  const renderResult = (data) => {
    if (isScalar(data)) {
      return renderScalar({ key: null, value: data, parentPath })
    }

    if (shouldRejsonDataBeDownloaded) {
      return data.map(renderRejsonDataBeDownloaded)
    }

    return Object.entries(data).map(renderArrayItem)
  }

  return (
    <>
      {renderResult(data)}
    </>
  )
}

export { RejsonDynamicTypes }
