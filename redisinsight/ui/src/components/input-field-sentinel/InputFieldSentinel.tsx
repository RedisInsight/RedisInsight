import {
  EuiFieldText,
  EuiIcon,
} from '@elastic/eui'
import { omit } from 'lodash'
import React, { useState } from 'react'
import cx from 'classnames'
import { useDebouncedEffect } from 'uiSrc/services'
import { NumericInput, PasswordInput } from 'uiSrc/components/base/inputs'

import styles from './styles.module.scss'

export enum SentinelInputFieldType {
  Text = 'text',
  Password = 'password',
  Number = 'number',
}

export interface Props {
  name?: string
  value?: string
  placeholder?: string
  inputType?: SentinelInputFieldType
  isText?: boolean
  isNumber?: boolean
  maxLength?: number
  min?: number
  max?: number
  isInvalid?: boolean
  disabled?: boolean
  className?: string
  append?: React.ReactElement
  onChangedInput: (name: string, value: string) => void
}

const InputFieldSentinel = (props: Props) => {
  const {
    name = '',
    value: valueProp = '',
    inputType = SentinelInputFieldType.Text,
    isInvalid: isInvalidProp = false,
    onChangedInput,
  } = props

  const clearProp = omit(props, 'inputType')

  const [value, setValue] = useState(valueProp)
  const [isInvalid, setIsInvalid] = useState(isInvalidProp)

  const handleChange = (value: string) => {
    setValue(value)
    isInvalid && setIsInvalid(false)
  }

  useDebouncedEffect(() => onChangedInput(name, value), 200, [value])

  return (
    <>
      {inputType === SentinelInputFieldType.Text && (
        <EuiFieldText
          {...clearProp}
          compressed
          value={value}
          onChange={(e) => handleChange(e.target?.value)}
          data-testid="sentinel-input"
        />
      )}
      {inputType === SentinelInputFieldType.Password && (
        <PasswordInput
          {...clearProp}
          value={value}
          onChange={(value) => handleChange(value)}
          data-testid="sentinel-input-password"
        />
      )}
      {inputType === SentinelInputFieldType.Number && (
        <NumericInput
          {...clearProp}
          autoValidate
          value={Number(value)}
          onChange={(value) => handleChange(value ? value.toString() : '')}
          data-testid="sentinel-input-number"
        />
      )}
      {isInvalid && (
        <EuiIcon
          color="danger"
          type="alert"
          className={cx(styles.inputInvalidIcon)}
        />
      )}
    </>
  )
}

export default InputFieldSentinel
