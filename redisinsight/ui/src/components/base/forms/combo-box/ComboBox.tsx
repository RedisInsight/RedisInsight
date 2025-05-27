import { MultiSelect } from '@redis-ui/components'
import React, { useState } from 'react'

export type ComboBoxProps = Omit<
  React.ComponentProps<typeof MultiSelect>,
  'id'
> & {
  onCreateOption?: (value: string) => void
  delimiter?: string
}

export const ComboBox = ({
  onCreateOption,
  delimiter,
  options,
  onChange,
  ...rest
}: ComboBoxProps) => {
  const [comboOptions, setComboOptions] = useState(options)
  const handleChange = (value: string[]) => {
    console.log({ value })
  }
  return (
    <MultiSelect {...rest} options={comboOptions} onChange={handleChange} />
  )
}

/*
              noSuggestions
              isClearable={false}
              placeholder="Enter Prefix"
              selectedOptions={prefixes}
              onCreateOption={(searchValue) =>
                setPrefixes([...prefixes, { label: searchValue }])
              }
              onChange={(selectedOptions) => setPrefixes(selectedOptions)}
              className={styles.combobox}
              data-testid="prefix-combobox"

              noSuggestions
              isClearable={false}
              placeholder=":"
              delimiter=" "
              selectedOptions={delimiters}
              onCreateOption={(del) =>
                setDelimiters([...delimiters, { label: del }])
              }
              onChange={(selectedOptions) => setDelimiters(selectedOptions)}
              className={styles.combobox}
              data-testid="delimiter-combobox"
 */
