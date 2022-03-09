import { EuiFieldSearch, keys } from '@elastic/eui'
import React, { ChangeEvent } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { SCAN_COUNT_DEFAULT } from 'uiSrc/constants/api'
import { replaceSpaces } from 'uiSrc/utils'
import { fetchKeys, keysSelector, setSearchMatch } from 'uiSrc/slices/keys'
import { setBrowserTreeNodesOpen, setBrowserTreeSelectedLeaf } from 'uiSrc/slices/app/context'

import styles from './styles.module.scss'

const SearchKeyList = () => {
  const dispatch = useDispatch()
  const { search: value = '' } = useSelector(keysSelector)

  const handleApply = () => {
    dispatch(fetchKeys('0', SCAN_COUNT_DEFAULT))

    // reset browser tree context
    dispatch(setBrowserTreeNodesOpen({}))
    dispatch(setBrowserTreeSelectedLeaf({}))
  }

  const handleChangeValue = (initValue: string) => {
    dispatch(setSearchMatch(initValue))
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === keys.ENTER) {
      handleApply()
    }
  }

  return (
    <div className={styles.container}>
      <EuiFieldSearch
        fullWidth={false}
        onKeyDown={onKeyDown}
        name="search-key"
        placeholder="Filter by Key Name or Pattern"
        autoComplete="off"
        value={value}
        className={styles.input}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          handleChangeValue(e.target.value)}
        data-testid="search-key"
      />
      <p className={styles.hiddenText}>{replaceSpaces(value)}</p>
    </div>
  )
}

export default SearchKeyList
