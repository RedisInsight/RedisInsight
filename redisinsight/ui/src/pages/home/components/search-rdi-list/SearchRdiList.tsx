import React from 'react'
import { EuiFieldSearch } from '@elastic/eui'
import { useDispatch, useSelector } from 'react-redux'

import { instancesSelector, loadInstancesSuccess } from 'uiSrc/slices/rdi/instances'
import { RdiInstance } from 'uiSrc/slices/interfaces'
import { lastConnectionFormat } from 'uiSrc/utils'

import styles from './styles.module.scss'

const SearchRdiList = () => {
  const { data: instances } = useSelector(instancesSelector)

  const dispatch = useDispatch()

  const onQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e?.target?.value?.toLowerCase()

    const visibleItems = instances.map(
      (item: RdiInstance) => ({
        ...item,
        visible: item.alias?.toLowerCase().indexOf(value) !== -1
        || item.url?.toString()?.indexOf(value) !== -1
        || item.version?.toString()?.indexOf(value) !== -1
        || lastConnectionFormat(item.lastConnection)?.indexOf(value) !== -1
      })
    )

    dispatch(loadInstancesSuccess(visibleItems))
  }

  return (
    <EuiFieldSearch
      isClearable
      placeholder="search instances"
      className={styles.search}
      onChange={onQueryChange}
      aria-label="Search rdi instance list"
      data-testid="search-rdi-instance-list"
    />
  )
}

export default SearchRdiList
