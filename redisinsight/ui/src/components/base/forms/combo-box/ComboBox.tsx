import { MultiSelect } from '@redis-ui/components'
import React from 'react'

export type ComboBoxProps = Omit<
  React.ComponentProps<typeof MultiSelect>,
  'id'
> & {
  onCreateOption: (value: string) => void
}

export const ComboBox = ({ onCreateOption, ...rest }: ComboBoxProps) => (
  <MultiSelect {...rest} />
)

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
