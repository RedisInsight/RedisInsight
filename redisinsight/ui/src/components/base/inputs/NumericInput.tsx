import React, { ComponentProps } from 'react'
import { NumericInput as RedisNumericInput } from '@redis-ui/components'
import { InputAppend } from './numeric-input.styles'

export type RedisNumericInputProps = ComponentProps<
  typeof RedisNumericInput
> & {
  append?: React.ReactNode
}

export default function NumericInput({
  append,
  ...props
}: RedisNumericInputProps) {
  return append ? (
    <InputAppend>
      <RedisNumericInput {...props} />
      {append}
    </InputAppend>
  ) : (
    <RedisNumericInput {...props} />
  )
}
