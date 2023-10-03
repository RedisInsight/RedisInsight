import { EuiButtonIcon, EuiToolTip, keys } from '@elastic/eui'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'

import { useParams } from 'react-router-dom'
import MultiSearch from 'uiSrc/components/multi-search/MultiSearch'
import { SCAN_COUNT_DEFAULT, SCAN_TREE_COUNT_DEFAULT } from 'uiSrc/constants/api'
import { replaceSpaces } from 'uiSrc/utils'
import {
  changeExactMatch,
  deleteSearchHistoryAction,
  fetchKeys,
  fetchSearchHistoryAction,
  keysSearchHistorySelector,
  keysSelector,
  setFilter,
  setSearchMatch
} from 'uiSrc/slices/browser/keys'
import { KeyViewType, SearchHistoryItem, SearchMode } from 'uiSrc/slices/interfaces/keys'
import { redisearchHistorySelector, redisearchSelector } from 'uiSrc/slices/browser/redisearch'

import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import styles from './styles.module.scss'

const placeholders = {
  [SearchMode.Pattern]: 'Filter by Key Name or Pattern',
  [SearchMode.Redisearch]: 'Search per Values of Keys',
}

const SearchKeyList = () => {
  const { id } = useSelector(connectedInstanceSelector)
  const { search, viewType, searchMode, exactMatch } = useSelector(keysSelector)
  const { search: redisearchQuery, selectedIndex } = useSelector(redisearchSelector)
  const { data: rediSearchHistory, loading: rediSearchHistoryLoading } = useSelector(redisearchHistorySelector)
  const { data: searchHistory, loading: searchHistoryLoading } = useSelector(keysSearchHistorySelector)

  const [value, setValue] = useState(search || '')
  const [disableSubmit, setDisableSubmit] = useState(false)

  const dispatch = useDispatch()
  const { instanceId } = useParams<{ instanceId: string }>()

  useEffect(() => {
    if (id) {
      dispatch(fetchSearchHistoryAction(searchMode))
    }
  }, [id, searchMode])

  useEffect(() => {
    setValue(searchMode === SearchMode.Pattern ? search : redisearchQuery)
  }, [searchMode, search, redisearchQuery])

  useEffect(() => {
    setDisableSubmit(searchMode === SearchMode.Redisearch && !selectedIndex)
  }, [searchMode, selectedIndex])

  const mapOptions = (data: null | Array<SearchHistoryItem>) => data?.map((item) => ({
    id: item.id,
    option: item.filter?.type,
    value: item.filter?.match
  })) || []

  const handleApply = (match = value, telemetryProperties: {} = {}) => {
    if (disableSubmit) return

    dispatch(setSearchMatch(match, searchMode))

    dispatch(fetchKeys(
      {
        searchMode,
        cursor: '0',
        count: viewType === KeyViewType.Browser ? SCAN_COUNT_DEFAULT : SCAN_TREE_COUNT_DEFAULT,
        telemetryProperties
      },
      () => { dispatch(fetchSearchHistoryAction(searchMode)) }
    ))
  }

  const handleChangeValue = (initValue: string) => {
    setValue(initValue)
  }

  const handleChangeOptions = () => {
    // now only one filter, so we delete option
    dispatch(setFilter(null))
    handleApply()
  }

  const handleApplySuggestion = (suggestion?: { option: string, value: string }) => {
    if (!suggestion) {
      handleApply()
      return
    }

    dispatch(setFilter(suggestion.option))
    setValue(suggestion.value)
    handleApply(suggestion.value, { source: 'history' })
  }

  const handleDeleteSuggestions = (ids: string[]) => {
    dispatch(deleteSearchHistoryAction(searchMode, ids))
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === keys.ENTER) {
      handleApply()
    }
  }

  const onClear = () => {
    handleChangeValue('')
    dispatch(setFilter(null))
    handleApply('')
  }

  const handleChangeExactMatch = () => {
    sendEventTelemetry({
      event: TelemetryEvent.BROWSER_FILTER_PER_PATTERN_CLICKED,
      eventData: {
        databaseId: instanceId,
        view: viewType,
        previous: exactMatch ? 'Exact' : 'Pattern',
        current: exactMatch ? 'Pattern' : 'Exact',
      }
    })
    dispatch(changeExactMatch(!exactMatch))

    if (value) {
      handleApply()
    }
  }

  return (
    <div className={cx(styles.container, { [styles.redisearchMode]: searchMode === SearchMode.Redisearch })}>
      <MultiSearch
        value={value}
        onSubmit={handleApply}
        onKeyDown={onKeyDown}
        onChange={handleChangeValue}
        onChangeOptions={handleChangeOptions}
        onClear={onClear}
        suggestions={{
          options: mapOptions(searchMode === SearchMode.Pattern ? searchHistory : rediSearchHistory),
          buttonTooltipTitle: 'Show History',
          loading: searchMode === SearchMode.Pattern ? searchHistoryLoading : rediSearchHistoryLoading,
          onApply: handleApplySuggestion,
          onDelete: handleDeleteSuggestions,
        }}
        optionalButton={searchMode === SearchMode.Pattern ? (
          <EuiToolTip
            title="Exact Search"
            content={exactMatch ? 'Disable to see keys matching your pattern' : 'Enable to see keys that exactly match your pattern'}
            position="bottom"
          >
            <EuiButtonIcon
              display="empty"
              iconType="bullseye"
              color="primary"
              size="xs"
              onClick={handleChangeExactMatch}
              aria-label="exact match button"
              className={cx(styles.exactSearchIcon, { [styles.disabled]: !exactMatch })}
              data-testid="exact-match-button"
            />
          </EuiToolTip>
        ) : null}
        disableSubmit={disableSubmit}
        placeholder={placeholders[searchMode]}
        className={styles.input}
        data-testid="search-key"
      />
      <p className={styles.hiddenText}>{replaceSpaces(value)}</p>
    </div>
  )
}

export default SearchKeyList
