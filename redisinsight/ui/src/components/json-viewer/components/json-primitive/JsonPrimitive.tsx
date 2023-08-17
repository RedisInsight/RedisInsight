import React from 'react'
import { isString, isBoolean, isNull, isNumber } from 'lodash'
import { isBigInt } from 'uiSrc/components/json-viewer/utils'
import { IDefaultProps } from 'uiSrc/components/json-viewer/interfaces'
import styles from 'uiSrc/components/json-viewer/styles.module.scss'

const JsonPrimitive = ({ data, lastElement = true }: IDefaultProps) => {
  let stringValue = data
  let valueStyle = styles.otherValue

  if (isNull(data)) {
    stringValue = 'null'
    valueStyle = styles.null
  } else if (isString(data)) {
    stringValue = `"${data}"`
    valueStyle = styles.string
  } else if (isBoolean(data)) {
    stringValue = data ? 'true' : 'false'
    valueStyle = styles.boolean
  } else if (isNumber(data)) {
    stringValue = data.toString()
    valueStyle = styles.number
  } else if (isBigInt(data)) {
    stringValue = data.toString()
    valueStyle = styles.bigint
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
