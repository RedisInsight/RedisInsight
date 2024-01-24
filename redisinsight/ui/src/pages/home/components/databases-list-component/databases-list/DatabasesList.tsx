import {
  Criteria,
  Direction,
  EuiInMemoryTable,
  EuiTableFieldDataColumnType,
  EuiTableSelectionType,
  PropertySort,
} from '@elastic/eui'
import cx from 'classnames'
import React, { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { instancesSelector } from 'uiSrc/slices/instances/instances'
import { Instance } from 'uiSrc/slices/interfaces'
import { Nullable } from 'uiSrc/utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { localStorageService } from 'uiSrc/services'
import { BrowserStorageItem } from 'uiSrc/constants'

import { ActionBar, DeleteAction, ExportAction } from './components'
import { findColumn, getColumnWidth, hideColumn } from './utils'

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
  const hiddenCols = useRef<Set<string>>(new Set([]))
  const lastHiddenColumn = useRef<EuiTableFieldDataColumnType<Instance>>()

  useEffect(() => {
    if (columnsToHide?.length && containerTableRef.current) {
      const { offsetWidth } = containerTableRef.current
      const beforeAdjustHiddenCols = hiddenCols.current.size
      try {
        const columnsResults = adjustColumns(columns, offsetWidth)
        if (beforeAdjustHiddenCols !== hiddenCols.current.size) {
          setColumns(columnsResults)
        }
      } catch (_) {
        // ignore
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

  const adjustColumns = (
    cols: EuiTableFieldDataColumnType<Instance>[],
    offsetWidth: number,
  ): EuiTableFieldDataColumnType<Instance>[] => {
    let sum = cols?.reduce((prev, next) => prev + getColumnWidth(next.width), 0)
    const visibleColumnsLength = cols.length - hiddenCols.current.size

    // hide columns
    if (sum > offsetWidth && columnsToHide.length + visibleColumnsLength) {
      let resultsCol = [...cols]
      while (sum > offsetWidth) {
        const colToHide = columnsToHide[hiddenCols.current.size]
        const initialCol = findColumn(columnsProp, colToHide)
        if (!initialCol) return resultsCol

        sum -= getColumnWidth(initialCol?.width)
        hiddenCols.current.add(colToHide)
        lastHiddenColumn.current = initialCol
        resultsCol = resultsCol.map((item) => (item.field === colToHide ? hideColumn(item) : item))
      }

      return resultsCol
    }

    // show columns
    if (columnsProp.length > visibleColumnsLength) {
      // early return to not calculate other columns
      const lastHiddenColWidth = getColumnWidth(lastHiddenColumn.current?.width)
      if (sum + lastHiddenColWidth > offsetWidth) {
        return cols
      }

      let resultsCol = [...cols]
      Array.from(hiddenCols.current).reverse().forEach((hiddenCol) => {
        const initialCol = findColumn(columnsProp, hiddenCol)
        if (!initialCol) return

        const hiddenColWidth = getColumnWidth(initialCol.width)
        if (hiddenColWidth + sum < offsetWidth) {
          hiddenCols.current.delete(hiddenCol)
          sum += hiddenColWidth
          lastHiddenColumn.current = initialCol
          resultsCol = resultsCol.map((item) => (item.field === hiddenCol ? initialCol : item))
        }
      })

      return resultsCol
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
