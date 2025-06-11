import React, { useState } from 'react'
import { KeyboardKeys as keys } from 'uiSrc/constants/keys'
import { Maybe } from 'uiSrc/utils'
import { SearchInput } from 'uiSrc/components/base/inputs'
import styles from './styles.module.scss'

export interface Props {
  appliedValue: string
  fieldName: string
  prependSearchName: string
  onApply?: (value: string) => void
  searchValidation?: Maybe<(value: string) => string>
}

const TableColumnSearch = (props: Props) => {
  const {
    fieldName,
    appliedValue,
    onApply = () => {},
    searchValidation,
  } = props
  const [value, setValue] = useState<string>('')

  const handleChangeValue = (initValue: string) => {
    const value = searchValidation ? searchValidation(initValue) : initValue
    setValue(value)
  }

  const handleApply = (_value: string): void => {
    if (appliedValue !== _value) {
      onApply(_value)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === keys.ENTER) {
      handleApply(value)
    }
  }

  return (
    <div className={styles.search}>
      <SearchInput
        onKeyDown={onKeyDown}
        name={fieldName}
        placeholder="Search"
        value={value || ''}
        onChange={handleChangeValue}
        data-testid="search"
      />
    </div>
  )
}

export default TableColumnSearch
