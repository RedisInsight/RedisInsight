import React, { ComponentProps } from 'react'

import { NumericInput as RedisNumericInput } from '@redis-ui/components'

export type RedisNumericInputProps = ComponentProps<typeof RedisNumericInput>

export default function NumericInput(props: RedisNumericInputProps) {
  return <RedisNumericInput {...props} />
}
