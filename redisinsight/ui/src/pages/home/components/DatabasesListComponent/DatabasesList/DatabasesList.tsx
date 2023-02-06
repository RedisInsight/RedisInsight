import {
  Criteria,
  Direction,
  EuiBasicTableColumn,
  EuiInMemoryTable,
  EuiTableSelectionType,
  PropertySort,
} from '@elastic/eui'
import cx from 'classnames'
import { first, last } from 'lodash'
import React, { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { instancesSelector } from 'uiSrc/slices/instances/instances'
import { Instance } from 'uiSrc/slices/interfaces'
import { Nullable } from 'uiSrc/utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { localStorageService } from 'uiSrc/services'
import { BrowserStorageItem } from 'uiSrc/constants'

import { ActionBar, DeleteAction, ExportAction } from './components'

import styles from '../styles.module.scss'

export interface Props {
  width: number
  dialogIsOpen: boolean
  editedInstance: Nullable<Instance>
  columnVariations: EuiBasicTableColumn<Instance>[][]
  onDelete: (ids: Instance[]) => void
  onExport: (ids: Instance[], withSecrets: boolean) => void
  onWheel: () => void
}

const columnsHideWidth = 950
const loadingMsg = 'loading...'

function DatabasesList({
  width,
  dialogIsOpen,
  columnVariations,
  onDelete,
  onExport,
  onWheel,
  editedInstance,
}: Props) {
  const [columns, setColumns] = useState(first(columnVariations))
  const [selection, setSelection] = useState<Instance[]>([])

  const { loading, data: instances } = useSelector(instancesSelector)

  const tableRef = useRef<EuiInMemoryTable<Instance>>(null)
  const containerTableRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerTableRef.current) {
      const { offsetWidth } = containerTableRef.current

      if (dialogIsOpen) {
        setColumns(columnVariations[1])
        return
      }

      if (
        offsetWidth < columnsHideWidth
        && columns?.length !== last(columnVariations)?.length
      ) {
        setColumns(last(columnVariations))
        return
      }

      if (
        offsetWidth > columnsHideWidth
        && columns?.length !== first(columnVariations)?.length
      ) {
        setColumns(first(columnVariations))
      }
    }
  }, [width])

  const sort: PropertySort = localStorageService.get(BrowserStorageItem.instancesSorting) ?? {
    field: 'lastConnection',
    direction: 'asc',
  }

  const selectionValue: EuiTableSelectionType<Instance> = {
    onSelectionChange: (selected: Instance[]) => setSelection(selected),
  }

  const handleResetSelection = () => {
    tableRef.current?.setSelection([])
  }

  const handleExport = (instances: Instance[], withSecrets: boolean) => {
    sendEventTelemetry({
      event: TelemetryEvent.CONFIG_DATABASES_REDIS_EXPORT_CLICKED
    })
    onExport(instances, withSecrets)
    tableRef.current?.setSelection([])
  }

  const toggleSelectedRow = (instance: Instance) => ({
    className: cx({
      'euiTableRow-isSelected': instance?.id === editedInstance?.id,
    }),
  })

  const onTableChange = ({ sort, page }: Criteria<Instance>) => {
    // calls also with page changing
    if (sort && !page) {
      localStorageService.set(BrowserStorageItem.instancesSorting, sort)
      sendEventSortedTelemetry(sort)
    }
  }

  const sendEventSortedTelemetry = (sort: { field: keyof Instance; direction: Direction }) =>
    sendEventTelemetry({
      event: TelemetryEvent.CONFIG_DATABASES_DATABASE_LIST_SORTED,
      eventData: sort
    })

  const noSearchResultsMsg = (
    <div className={styles.noSearchResults}>
      <div className={styles.tableMsgTitle}>No results found</div>
      <div>No databases matched your search. Try reducing the criteria.</div>
    </div>
  )

  return (
    <div className="databaseList" ref={containerTableRef}>
      <EuiInMemoryTable
        ref={tableRef}
        items={instances.filter(({ visible = true }) => visible)}
        itemId="id"
        loading={loading}
        message={instances.length ? noSearchResultsMsg : loadingMsg}
        columns={columns ?? []}
        rowProps={toggleSelectedRow}
        sorting={{ sort }}
        selection={selectionValue}
        onWheel={onWheel}
        onTableChange={onTableChange}
        isSelectable
      />

      {selection.length > 0 && (
        <ActionBar
          selectionCount={selection.length}
          onCloseActionBar={handleResetSelection}
          actions={[
            <ExportAction selection={selection} onExport={handleExport} />,
            <DeleteAction selection={selection} onDelete={onDelete} />
          ]}
          width={width}
        />
      )}
    </div>
  )
}

export default DatabasesList
