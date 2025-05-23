import React, { ChangeEvent } from 'react'
import { Checkbox as RedisUiCheckbox, CheckedType } from '@redis-ui/components'

export type CheckboxProps = Omit<
  React.ComponentProps<typeof RedisUiCheckbox>,
  'onChange'
> & {
  onCheckedChange?: (checked: CheckedType) => void
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void
  name?: string
  id?: string
}

export const Checkbox = (props: CheckboxProps) => {
  const { onChange, onCheckedChange, id, ...rest } = props

  const handleCheckedChange = (checked: CheckedType) => {
    const syntheticEvent = {
      target: {
        checked: checked === true,
        type: 'checkbox',
        name: rest.name,
        id,
      },
    } as React.ChangeEvent<HTMLInputElement>
    onChange?.(syntheticEvent)
    onCheckedChange?.(checked)
  }

  return (
    <RedisUiCheckbox {...rest} id={id} onCheckedChange={handleCheckedChange} />
  )
}
