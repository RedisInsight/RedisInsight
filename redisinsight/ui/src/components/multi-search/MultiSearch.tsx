import {
  EuiButtonEmpty,
  EuiButtonIcon,
  EuiFieldText,
  EuiIcon,
  EuiOutsideClickDetector,
  EuiProgress,
  EuiToolTip,
  keys
} from '@elastic/eui'
import cx from 'classnames'
import React, { ChangeEvent, useEffect, useRef, useState } from 'react'
import { GroupBadge } from 'uiSrc/components'
import { Nullable } from 'uiSrc/utils'

import { ReactComponent as CloudStars } from 'uiSrc/assets/img/oauth/stars.svg'

import styles from './styles.module.scss'

export interface Props {
  value: string
  options?: string[]
  placeholder: string
  disableSubmit?: boolean
  onSubmit: () => void
  onKeyDown?: (e: React.KeyboardEvent) => void
  suggestions?: {
    options: null | Array<{
      id: string
      option?: Nullable<string>
      value: string
    }>
    buttonTooltipTitle: string
    onApply: (suggestion: any) => void
    onDelete: (ids: string[]) => void
    loading?: boolean
  }
  onChange: (value: string) => void
  onChangeOptions?: (options: string[]) => void
  onClear?: () => void
  onAskCopilot?: () => void
  className?: string
  compressed?: boolean
  [key: string]: any
}

const MultiSearch = (props: Props) => {
  const {
    value,
    options = [],
    suggestions,
    placeholder,
    disableSubmit,
    onSubmit,
    onChangeOptions,
    onChange,
    onKeyDown,
    onClear = () => {},
    onAskCopilot,
    className,
    compressed,
    ...rest
  } = props
  const [isInputFocus, setIsInputFocus] = useState<boolean>(false)
  const [showAutoSuggestions, setShowAutoSuggestions] = useState<boolean>(false)
  const [focusedItem, setFocusedItem] = useState<number>(-1)

  const inputRef = useRef<HTMLInputElement>(null)

  const { options: suggestionOptions = [] } = suggestions ?? {}

  const isArrowUpOrDown = (key: string) => [keys.ARROW_DOWN, keys.ARROW_UP].includes(key)

  useEffect(() => {
    if (!suggestionOptions?.length) {
      setFocusedItem(-1)
      setShowAutoSuggestions(false)
    }
  }, [suggestionOptions])

  const onDeleteOption = (option: string) => {
    onChangeOptions?.(options.filter((item) => item !== option))
  }

  const exitAutoSuggestions = () => {
    setFocusedItem(-1)
    setShowAutoSuggestions(false)
  }

  const handleApplySuggestion = (index: number) => {
    suggestions?.onApply?.(suggestionOptions?.[index] ?? null)
    setFocusedItem(-1)
    setShowAutoSuggestions(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation()

    if (!suggestionOptions?.length) {
      onKeyDown?.(e)
      return
    }

    const min = -1
    const max = suggestionOptions.length - 1

    if (!showAutoSuggestions && isArrowUpOrDown(e.key)) {
      e.preventDefault()
      setShowAutoSuggestions(true)
      setFocusedItem(-1)
      return
    }

    if (!showAutoSuggestions) {
      onKeyDown?.(e)
      return
    }

    if (isArrowUpOrDown(e.key)) {
      e.preventDefault()
      const diff = focusedItem + (keys.ARROW_DOWN === e.key ? 1 : -1)
      setFocusedItem(diff > max ? min : (diff < min ? max : diff))
    }

    if (e.key === 'Delete') {
      focusedItem > -1 && e.preventDefault()
      handleDeleteSuggestion(focusedItem > -1 ? [suggestionOptions[focusedItem].id] : undefined)
    }

    if (keys.ESCAPE === e.key) setShowAutoSuggestions(false)
    if (keys.TAB === e.key) exitAutoSuggestions()
    if (keys.ENTER === e.key) handleApplySuggestion(focusedItem)
  }

  const handleDeleteSuggestion = (ids?: string[]) => {
    inputRef.current?.focus()
    if (ids) {
      suggestions?.onDelete?.(ids)
    }
  }

  const handleSubmit = () => {
    exitAutoSuggestions()
    onSubmit()
  }

  const SubmitBtn = () => (
    <EuiButtonIcon
      iconType="search"
      color="primary"
      aria-label="Search"
      disabled={disableSubmit}
      className={styles.searchButton}
      iconSize="s"
      onClick={handleSubmit}
      data-testid="search-btn"
    />
  )

  return (
    <EuiOutsideClickDetector onOutsideClick={exitAutoSuggestions}>
      <div
        className={cx(styles.multiSearchWrapper, className)}
        onKeyDown={handleKeyDown}
        role="presentation"
        data-testid="multi-search"
      >
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
            onKeyDown={handleKeyDown}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
            onFocus={() => setIsInputFocus(true)}
            onBlur={() => setIsInputFocus(false)}
            controlOnly
            inputRef={inputRef}
            {...rest}
          />
          {showAutoSuggestions && !!suggestionOptions?.length && (
            <div role="presentation" className={styles.autoSuggestions} data-testid="suggestions">
              {suggestions?.loading && (
                <EuiProgress
                  color="primary"
                  size="xs"
                  position="absolute"
                  data-testid="progress-suggestions"
                />
              )}
              <ul role="listbox">
                {suggestionOptions?.map(({ id, option, value }, index) => (
                  value && (
                    <li
                      key={id}
                      className={cx(styles.suggestion, { [styles.focused]: focusedItem === index })}
                      onClick={() => handleApplySuggestion(index)}
                      role="presentation"
                      data-testid={`suggestion-item-${id}`}
                    >
                      {option && (
                        <GroupBadge
                          type={option}
                          compressed={compressed}
                          className={styles.suggestionOption}
                        />
                      )}
                      <span className={styles.suggestionText} data-testid="suggestion-item-text">{value}</span>
                      <EuiButtonIcon
                        className={styles.suggestionRemoveBtn}
                        iconType="cross"
                        color="primary"
                        aria-label="Remove History Record"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation()
                          handleDeleteSuggestion([id])
                        }}
                        data-testid={`remove-suggestion-item-${id}`}
                      />
                    </li>
                  )
                ))}
              </ul>
              <div
                role="presentation"
                className={styles.clearHistory}
                onClick={() => handleDeleteSuggestion(suggestionOptions?.map((item) => item.id))}
                data-testid="clear-history-btn"
              >
                <EuiIcon type="eraser" style={{ marginRight: 6 }} />
                <span>Clear history</span>
              </div>
            </div>
          )}
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
          {!!suggestionOptions?.length && (
            <EuiToolTip
              content={suggestions?.buttonTooltipTitle}
              position="bottom"
            >
              <EuiButtonIcon
                display="empty"
                iconType="sortable"
                color="primary"
                size="xs"
                aria-label={suggestions?.buttonTooltipTitle}
                onClick={() => {
                  setShowAutoSuggestions((v) => !v)
                  inputRef.current?.focus()
                }}
                className={styles.historyIcon}
                data-testid="show-suggestions-btn"
              />
            </EuiToolTip>
          )}
          {!!onAskCopilot && (
            <EuiButtonEmpty
              className={styles.askCopilotBtn}
              size="xs"
              onClick={onAskCopilot}
            >
              <EuiIcon className={styles.cloudIcon} type={CloudStars} />
              <span>Ask Redis Copilot</span>
            </EuiButtonEmpty>
          )}
          {disableSubmit && (
            <EuiToolTip
              position="top"
              display="inlineBlock"
              anchorClassName={styles.anchorSubmitBtn}
              content="Please choose index in order to preform the search"
            >
              {SubmitBtn()}
            </EuiToolTip>
          )}
          {!disableSubmit && SubmitBtn()}
        </div>
      </div>
    </EuiOutsideClickDetector>
  )
}

export default MultiSearch
