import React from 'react'
import { EuiFieldSearch } from '@elastic/eui'
import { useDispatch, useSelector } from 'react-redux'

import { instancesSelector, loadInstancesSuccess } from 'uiSrc/slices/instances/instances'
import { CONNECTION_TYPE_DISPLAY, Instance } from 'uiSrc/slices/interfaces'
import { lastConnectionFormat } from 'uiSrc/utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import styles from './styles.module.scss'

export interface Props {
  onAddInstance: () => void
  direction: 'column' | 'row'
  welcomePage?: boolean
}

const SearchDatabasesList = () => {
  const { data: instances } = useSelector(instancesSelector)

  const dispatch = useDispatch()

  const onQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e?.target?.value?.toLowerCase()

    const itemsTemp = instances.map(
      (item: Instance) => ({
        ...item,
        visible: item.name?.toLowerCase().indexOf(value) !== -1
        || item.host?.toString()?.indexOf(value) !== -1
        || item.port?.toString()?.indexOf(value) !== -1
        || (item.connectionType && CONNECTION_TYPE_DISPLAY[item.connectionType]?.toLowerCase()?.indexOf(value) !== -1)
        || item.modules?.map((m) => m.name?.toLowerCase()).join(',').indexOf(value) !== -1
        || lastConnectionFormat(item.lastConnection)?.indexOf(value) !== -1
      })
    )

    sendEventTelemetry({
      event: TelemetryEvent.CONFIG_DATABASES_DATABASE_LIST_SEARCHED,
      eventData: {
        instancesFullCount: instances.length,
        instancesSearchedCount: itemsTemp.filter(({ visible }) => (visible))?.length,
      }
    })

    dispatch(loadInstancesSuccess(itemsTemp))
  }

  return (
    <EuiFieldSearch
      isClearable
      placeholder="Database List Search"
      className={styles.search}
      onChange={onQueryChange}
      aria-label="Search database list"
      data-testid="search-database-list"
    />
  )
}

export default SearchDatabasesList
