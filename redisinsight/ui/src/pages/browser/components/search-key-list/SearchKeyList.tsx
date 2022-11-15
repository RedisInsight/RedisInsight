import { keys } from '@elastic/eui'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'

import MultiSearch from 'uiSrc/components/multi-search/MultiSearch'
import { SCAN_COUNT_DEFAULT, SCAN_TREE_COUNT_DEFAULT } from 'uiSrc/constants/api'
import { replaceSpaces } from 'uiSrc/utils'
import { fetchKeys, keysSelector, setFilter, setSearchMatch } from 'uiSrc/slices/browser/keys'
import { resetBrowserTree } from 'uiSrc/slices/app/context'
import { SearchMode, KeyViewType } from 'uiSrc/slices/interfaces/keys'
import { redisearchSelector } from 'uiSrc/slices/browser/redisearch'

import styles from './styles.module.scss'

const placeholders = {
  [SearchMode.Pattern]: 'Filter by Key Name or Pattern',
  [SearchMode.Redisearch]: 'Search per Values of Keys',
}

const SearchKeyList = () => {
  const dispatch = useDispatch()
  const { search, viewType, filter, searchMode } = useSelector(keysSelector)
  const { search: redisearchQuery } = useSelector(redisearchSelector)
  const [options, setOptions] = useState<string[]>(filter ? [filter] : [])

  const [value, setValue] = useState(search || '')

  useEffect(() => {
    setOptions(filter ? [filter] : [])
  }, [filter])

  useEffect(() => {
    setValue(searchMode === SearchMode.Pattern ? search : redisearchQuery)
  }, [searchMode, search, redisearchQuery])

  const handleApply = (match = value) => {
    dispatch(setSearchMatch(match, searchMode))
    // reset browser tree context
    dispatch(resetBrowserTree())

    dispatch(fetchKeys(
      searchMode,
      '0',
      viewType === KeyViewType.Browser ? SCAN_COUNT_DEFAULT : SCAN_TREE_COUNT_DEFAULT
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

  return (
    <div className={cx(styles.container, { [styles.redisearchMode]: searchMode === SearchMode.Redisearch })}>
      <MultiSearch
        value={value}
        onSubmit={handleApply}
        onKeyDown={onKeyDown}
        onChange={handleChangeValue}
        onChangeOptions={handleChangeOptions}
        onClear={onClear}
        options={searchMode === SearchMode.Pattern ? options : []}
        placeholder={placeholders[searchMode]}
        className={styles.input}
        data-testid="search-key"
      />
      <p className={styles.hiddenText}>{replaceSpaces(value)}</p>
    </div>
  )
}

export default SearchKeyList
