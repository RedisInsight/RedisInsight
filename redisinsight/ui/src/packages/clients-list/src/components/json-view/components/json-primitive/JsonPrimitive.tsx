import React from 'react'
import { isString, isBoolean, isNull, isNumber } from 'lodash'
import { isBigInt } from '../../utils'
import { IDefaultProps } from '../../interfaces'

const JsonPrimitive = ({ data, lastElement = true }: IDefaultProps) => {
  let stringValue = data
  let valueStyle = 'otherValue'

  if (isNull(data)) {
    stringValue = 'null'
    valueStyle = 'null'
  } else if (data === undefined) {
    stringValue = 'undefined'
    valueStyle = 'undefined'
  } else if (isString(data)) {
    stringValue = `"${data}"`
    valueStyle = 'string'
  } else if (isBoolean(data)) {
    stringValue = data ? 'true' : 'false'
    valueStyle = 'boolean'
  } else if (isNumber(data)) {
    stringValue = data.toString()
    valueStyle = 'number'
  } else if (isBigInt(data)) {
    stringValue = data.toString()
    valueStyle = 'bigint'
  } else {
    stringValue = data.toString()
  }
  return (
    <span data-testid="json-primitive-component">
      <span className={valueStyle} data-testid="json-primitive-value">{stringValue}</span>
      {!lastElement && ','}
      {'\n'}
    </span>
  )
}

export default JsonPrimitive
