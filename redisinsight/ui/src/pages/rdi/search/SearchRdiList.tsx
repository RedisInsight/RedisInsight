import { EuiFieldSearch } from '@elastic/eui'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { RdiInstance } from 'uiSrc/slices/interfaces'
import { instancesSelector, loadInstancesSuccess } from 'uiSrc/slices/rdi/instances'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
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
        visible: item.name.toLowerCase().indexOf(value) !== -1
        || item.url?.toString()?.indexOf(value) !== -1
        || item.version?.toString()?.indexOf(value) !== -1
        || lastConnectionFormat(item.lastConnection)?.indexOf(value) !== -1
      })
    )

    sendEventTelemetry({
      event: TelemetryEvent.CONFIG_RDI_INSTANCES_LIST_SEARCHED,
      eventData: {
        instancesFullCount: instances.length,
        instancesSearchedCount: visibleItems.filter(({ visible }) => (visible))?.length,
      }
    })

    dispatch(loadInstancesSuccess(visibleItems))
  }

  return (
    <EuiFieldSearch
      isClearable
      fullWidth
      placeholder="Instance search"
      className={styles.search}
      onChange={onQueryChange}
      aria-label="Search rdi instance list"
      data-testid="search-rdi-instance-list"
    />
  )
}

export default SearchRdiList
