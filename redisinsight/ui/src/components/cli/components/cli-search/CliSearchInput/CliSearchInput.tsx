import React, { ChangeEvent, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { EuiFieldSearch } from '@elastic/eui'

import { cliSettingsSelector } from 'uiSrc/slices/cli/cli-settings'

import styles from './styles.module.scss'

export interface Props {
  submitSearch: (searchValue: string) => void
  isLoading?: boolean;
}

const CliSearchInput = ({ submitSearch, isLoading = false }: Props) => {
  const [searchValue, setSearchValue] = useState<string>('')
  const { isEnteringCommand, matchedCommand } = useSelector(cliSettingsSelector)

  useEffect(() => {
    if (isEnteringCommand && matchedCommand) {
      setSearchValue('')
    }
  }, [isEnteringCommand])

  useEffect(() => {
    setSearchValue('')
  }, [matchedCommand])

  const onChangeSearch = (value: string) => {
    setSearchValue(value)
    submitSearch(value)
  }

  return (
    <div className={styles.container}>
      <EuiFieldSearch
        isLoading={isLoading}
        disabled={isLoading}
        fullWidth={false}
        name="search-command"
        placeholder="Search for a command"
        autoComplete="off"
        value={searchValue}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChangeSearch(e.target.value)}
        className={styles.searchInput}
        data-testid="cli-helper-search"
      />
    </div>
  )
}

export default CliSearchInput
