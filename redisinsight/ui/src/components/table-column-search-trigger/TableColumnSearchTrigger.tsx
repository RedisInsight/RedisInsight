import React, { ChangeEvent, useState, useEffect } from 'react'
import cx from 'classnames'
import { EuiButtonIcon, EuiFieldSearch, keys } from '@elastic/eui'

import { Maybe, Nullable } from 'uiSrc/utils'
import styles from './styles.module.scss'

export interface Props {
  isOpen: boolean
  appliedValue: string
  initialValue?: string
  handleOpenState: (isOpen: boolean) => void
  fieldName: string
  prependSearchName: string
  onApply?: (value: string) => void
  searchValidation?: Maybe<(value: string) => string>
}

const TableColumnSearchTrigger = (props: Props) => {
  const {
    isOpen,
    handleOpenState,
    fieldName,
    appliedValue,
    initialValue = '',
    prependSearchName,
    onApply = () => {},
    searchValidation,
  } = props
  const [inputEl, setInputEl] = useState<Nullable<HTMLInputElement>>(null)
  const [value, setValue] = useState<string>(initialValue)

  useEffect(() => {
    if (isOpen && !!inputEl) {
      inputEl.focus()
    }
  }, [isOpen])

  const handleChangeValue = (initValue: string) => {
    const value = searchValidation ? searchValidation(initValue) : initValue
    setValue(value)
  }

  const handleOpen = () => {
    handleOpenState(true)
  }

  const handleOnBlur = (e?: React.FocusEvent<HTMLInputElement>) => {
    const relatedTarget = e?.relatedTarget as HTMLInputElement
    const target = e?.target as HTMLInputElement
    if (relatedTarget?.classList.contains('euiFormControlLayoutClearButton')) {
      return
    }
    if (!target.value) {
      handleOpenState(false)
    }
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
    <div style={{ paddingRight: 10 }}>
      <EuiButtonIcon
        iconType="search"
        aria-label={`Search ${fieldName}`}
        color="primary"
        onClick={handleOpen}
        data-testid="search-button"
      />
      <div
        className={cx(styles.search)}
        style={{ display: isOpen ? 'block' : 'none' }}
      >
        <EuiFieldSearch
          onKeyDown={onKeyDown}
          onBlur={handleOnBlur}
          inputRef={setInputEl}
          name={fieldName}
          fullWidth
          prepend={prependSearchName}
          placeholder="Search"
          value={value || ''}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            handleChangeValue(e.target.value)
          }
          data-testid="search"
        />
      </div>
    </div>
  )
}

export default TableColumnSearchTrigger
