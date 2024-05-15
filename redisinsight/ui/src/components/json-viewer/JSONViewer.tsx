import cx from 'classnames'
import React from 'react'
import JSONBigInt from 'json-bigint'

import JsonPretty from 'uiSrc/components/json-viewer/components/json-pretty'

interface Props {
  value: string
  expanded?: boolean
  space?: number
  useNativeBigInt?: boolean
  fallbackToNonBigInt?: boolean
}

const RenderJSONValue = (value: string, expanded: boolean, space: number, useNativeBigInt: boolean) => {
  const data = JSONBigInt({ useNativeBigInt }).parse(value)
  return (
    <div className={cx('jsonViewer', { 'jsonViewer-collapsed': !expanded })} data-testid="value-as-json">
      <JsonPretty data={data} space={space} />
    </div>
  )
}

const JSONViewer = (props: Props) => {
  const { value, expanded = false, space = 2, useNativeBigInt = true, fallbackToNonBigInt } = props

  try {
    const jsonValue = RenderJSONValue(value, expanded, space, useNativeBigInt)
    return {
      value: jsonValue,
      isValid: true
    }
  } catch (e) {
    if (fallbackToNonBigInt) {
      try {
        const jsonValue = RenderJSONValue(value, expanded, space, false)
        return {
          value: jsonValue,
          isValid: true
        }
      } catch (e) {
        // ignore
      }
    }

    return {
      value,
      isValid: false
    }
  }
}

export default JSONViewer
