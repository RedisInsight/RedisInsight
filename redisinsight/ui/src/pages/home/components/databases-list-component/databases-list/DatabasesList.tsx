import {
  Criteria,
  Direction,
  EuiInMemoryTable,
  EuiTableFieldDataColumnType,
  EuiTableSelectionType,
  PropertySort,
} from '@elastic/eui'
import cx from 'classnames'
import { find } from 'lodash'
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
  editedInstance: Nullable<Instance>
  columns: EuiTableFieldDataColumnType<Instance>[]
  columnsToHide?: string[]
  onDelete: (ids: Instance[]) => void
  onExport: (ids: Instance[], withSecrets: boolean) => void
  onWheel: () => void
}

const MIN_COLUMN_LENGTH = 180
const loadingMsg = 'loading...'

function DatabasesList({
  width,
  columns: columnsProp,
  columnsToHide = [],
  onDelete,
  onExport,
  onWheel,
  editedInstance,
}: Props) {
  const [columns, setColumns] = useState<EuiTableFieldDataColumnType<Instance>[]>(columnsProp)
  const [selection, setSelection] = useState<Instance[]>([])

  const { loading, data: instances } = useSelector(instancesSelector)

  const tableRef = useRef<EuiInMemoryTable<Instance>>(null)
  const containerTableRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerTableRef.current) {
      const { offsetWidth } = containerTableRef.current
      const columnsResults = adjustColumns(columns, offsetWidth)
      if (columnsResults?.length !== columns?.length) {
        setColumns(columnsResults)
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

  const getColumnWidth = (width?: string) => (width && /^[0-9]+px/.test(width) ? parseInt(width, 10) : MIN_COLUMN_LENGTH)

  const adjustColumns = (
    cols: EuiTableFieldDataColumnType<Instance>[],
    offsetWidth: number,
    numberOfChangedColumns: number = 0
  ): EuiTableFieldDataColumnType<Instance>[] => {
    const sum = cols?.reduce((prev, next) => {
      const columnWidth = getColumnWidth(next.width)
      return prev + columnWidth
    }, 0)

    // remove columns
    if (sum > offsetWidth && columnsProp.length < columnsToHide.length + cols.length) {
      return adjustColumns(
        cols.filter(({ field }) => !columnsToHide.slice(0, numberOfChangedColumns + 1).includes(field)),
        offsetWidth,
        numberOfChangedColumns + 1
      )
    }

    // recover columns
    if (columnsProp.length > cols.length) {
      const lastRemovedColumnName = columnsToHide[columnsProp.length - cols.length - 1]
      if (lastRemovedColumnName) {
        const lastRemovedColumn = find(columnsProp, ({ field }) => field === lastRemovedColumnName)
        const lastRemovedColumnWidth = getColumnWidth(lastRemovedColumn?.width)

        if (lastRemovedColumnWidth + sum < offsetWidth) {
          return adjustColumns(
            columnsProp.filter(({ field }) => find([...cols, lastRemovedColumn], (item) => item?.field === field)),
            offsetWidth,
          )
        }
      }
    }

    return cols
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
        responsive={false}
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
