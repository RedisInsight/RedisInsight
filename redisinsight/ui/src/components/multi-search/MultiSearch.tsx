import { EuiButtonIcon, EuiFieldText, EuiToolTip } from '@elastic/eui'
import cx from 'classnames'
import React, { ChangeEvent, useState } from 'react'
import { GroupBadge } from 'uiSrc/components'

import styles from './styles.module.scss'

export interface Props {
  value: string
  options: string[]
  placeholder: string
  onSubmit: () => void
  onChange: (value: string) => void
  onChangeOptions?: (options: string[]) => void
  onClear?: () => void
  className?: string
  compressed?: boolean
  [key: string]: any
}

const MultiSearch = (props: Props) => {
  const {
    value,
    options = [],
    placeholder,
    onSubmit,
    onChangeOptions,
    onChange,
    onClear = () => {},
    className,
    compressed,
    ...rest
  } = props
  const [isInputFocus, setIsInputFocus] = useState<boolean>(false)

  const onDeleteOption = (option: string) => {
    onChangeOptions?.(options.filter((item) => item !== option))
  }

  return (
    <div className={cx(styles.multiSearchWrapper, className)} data-testid="multi-search">
      <div className={cx(styles.multiSearch, { [styles.isFocused]: isInputFocus })}>
        <div>
          {options.map((option) => (
            <GroupBadge key={option} type={option} onDelete={onDeleteOption} compressed={compressed} />
          ))}
        </div>
        <EuiFieldText
          className={styles.multiSearchInput}
          placeholder={placeholder}
          value={value}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          onFocus={() => setIsInputFocus(true)}
          onBlur={() => setIsInputFocus(false)}
          controlOnly
          {...rest}
        />
        {(value || !!options.length) && (
          <EuiToolTip
            content="Reset Filters"
            position="bottom"
          >
            <EuiButtonIcon
              display="empty"
              iconType="cross"
              color="primary"
              size="xs"
              aria-label="Reset Filters"
              onClick={onClear}
              className={styles.clearButton}
              data-testid="reset-filter-btn"
            />
          </EuiToolTip>
        )}
      </div>
      <EuiButtonIcon
        iconType="search"
        color="primary"
        aria-label="Search"
        className={styles.searchButton}
        onClick={() => onSubmit()}
        data-testid="search-btn"
      />
    </div>
  )
}

export default MultiSearch
