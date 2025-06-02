import React, { useState } from 'react'
import { Chip, FormField, Input } from '@redis-ui/components'
import cn from 'classnames'
import styled from 'styled-components'
import { CommonProps } from 'uiSrc/components/base/theme/types'
import { Row } from 'uiSrc/components/base/layout/flex'

export type AutoTagOption<T = string | number | string[] | undefined> = {
  label: string
  key?: string
  value?: T
}
export type AutoTagProps = Omit<
  React.ComponentProps<typeof FormField>,
  'children' | 'onChange'
> &
  CommonProps & {
    isClearable?: boolean
    placeholder?: string
    delimiter?: string
    options?: AutoTagOption[]
    selectedOptions?: AutoTagOption[]
    onCreateOption?: (value: string, options?: AutoTagOption[]) => void
    onChange?: (value: AutoTagOption[]) => void
    size?: 'S' | 'M'
    full?: boolean
  }

export function getTagFromValue(value: string, delimiter: string) {
  const delimiterFirstIndex = value.indexOf(delimiter)
  if (delimiterFirstIndex > -1) {
    const firstValue = value.slice(0, delimiterFirstIndex)
    if (firstValue !== '') {
      return firstValue
    }
  }
  return null
}

export function filterOptions(
  selection: AutoTagOption[],
  value?: AutoTagOption['value'],
  label?: AutoTagOption['label'],
) {
  // remove option from selection
  return selection.filter((option) => {
    if (value) return option.value !== value
    if (label) return option.label !== label
    return false
  })
}

export const AutoTag = ({
  className,
  isClearable,
  placeholder,
  options,
  selectedOptions,
  onCreateOption,
  delimiter = '',
  onChange,
  style,
  size = 'S',
  full = false,
  ...rest
}: AutoTagProps) => {
  const [initialOptions, setInitialOptions] = useState(options || [])
  const [selection, setSelection] = useState(selectedOptions || [])
  const [tag, setTag] = useState('')
  const createOption = (value: string) => {
    // create a new option
    const newOption = {
      label: value,
      value,
    }
    // add the new option to options
    const newOptions = [...initialOptions, newOption]
    setTag('')
    setInitialOptions(newOptions)
    setSelection([...selection, newOption])
    // add the new option to selection
    onCreateOption?.(value, newOptions)
  }
  const handleInputChange = (value: string) => {
    const tag = getTagFromValue(value, delimiter)
    if (tag !== null) {
      createOption(tag)
      return
    }
    setTag(value)
  }

  function getPlaceholder() {
    return selectedOptions?.length && selectedOptions.length > 0
      ? undefined
      : placeholder
  }

  return (
    <FormField
      {...rest}
      className={cn('RI-combo-box', className)}
      style={{
        ...style,
        columnGap: '0.5rem',
        width: full ? '100%' : undefined,
      }}
    >
      <StyledWrapper
        justify="start"
        wrap
        gap="s"
        className="RI-auto-tag__container"
        full
      >
        <Row
          gap="s"
          className="RI-auto-tag__selection"
          wrap
          justify="start"
          grow={false}
          align="center"
        >
          {selection?.map(({ value, label }, idx) => {
            const key = `${label}-${value}-${idx}`
            return (
              <Chip
                size={size}
                key={key}
                text={String(label || value || '')}
                onClose={() => {
                  // remove option from selection
                  const newSelection = filterOptions(selection, value, label)
                  setSelection(newSelection)
                  // remove option from options
                  const newOptions = filterOptions(initialOptions, value, label)
                  setInitialOptions(newOptions)
                  // call onChange
                  onChange?.(newSelection)
                }}
              />
            )
          })}
          <Input
            variant="underline"
            autoSize
            placeholder={getPlaceholder()}
            onChange={handleInputChange}
            value={tag}
          />
        </Row>
      </StyledWrapper>
    </FormField>
  )
}

const StyledWrapper = styled(Row)`
  border: 1px solid ${({ theme }) => theme.semantic.color.border.neutral600};
  border-radius: 0.4rem;
  padding: 0.15rem 0.5rem;
  background-color: ${({ theme }) =>
    theme.semantic.color.background.neutral100};
`
