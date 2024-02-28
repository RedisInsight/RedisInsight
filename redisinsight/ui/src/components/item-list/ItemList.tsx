import {
  Criteria,
  EuiInMemoryTable,
  EuiTableFieldDataColumnType,
  EuiTableSelectionType,
  PropertySort,
} from '@elastic/eui'
import cx from 'classnames'
import React, { useEffect, useRef, useState } from 'react'
import { Maybe, Nullable } from 'uiSrc/utils'
import { findColumn, getColumnWidth, hideColumn } from './utils'

import { ActionBar, DeleteAction, ExportAction } from './components'

import './styles.scss'
import styles from './styles.module.scss'

export interface Props<T> {
  width: number
  editedInstance: Nullable<T>
  columns: EuiTableFieldDataColumnType<T>[]
  columnsToHide?: string[]
  onDelete: (ids: T[]) => void
  hideExport?: boolean
  onExport?: (ids: T[], withSecrets: boolean) => void
  onWheel: () => void
  loading: boolean
  data: T[]
  onTableChange: ({ sort, page }: Criteria<T>) => void
  sort: PropertySort
}

function ItemList<T extends { id: string; visible?: boolean }>({
  width,
  columns: columnsProp,
  columnsToHide = [],
  onDelete,
  hideExport = false,
  onExport,
  onWheel,
  editedInstance,
  loading,
  data: instances,
  onTableChange,
  sort
}: Props<T>) {
  const [columns, setColumns] = useState<EuiTableFieldDataColumnType<T>[]>(columnsProp)
  const [selection, setSelection] = useState<T[]>([])
  const [message, setMessage] = useState<Maybe<string | JSX.Element>>(undefined)

  const tableRef = useRef<EuiInMemoryTable<T>>(null)
  const containerTableRef = useRef<HTMLDivElement>(null)

  const hiddenCols = useRef<Set<string>>(new Set([]))
  const lastHiddenColumn = useRef<EuiTableFieldDataColumnType<T>>()

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

  useEffect(() => {
    if (loading) {
      setMessage('loading...')
      return
    }

    if (!instances.length) {
      // TODO: add proper message about no instances
      setMessage('No Added instances')
      return
    }

    if (instances.length && instances.every(({ visible }) => !visible)) {
      setMessage(
        <div className={styles.noResults}>
          <div className={styles.tableMsgTitle}>No results found</div>
          <div>No results matched your search. Try reducing the criteria.</div>
        </div>
      )
    }
  }, [instances, loading])

  const adjustColumns = (
    cols: EuiTableFieldDataColumnType<T>[],
    offsetWidth: number,
  ): EuiTableFieldDataColumnType<T>[] => {
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

  const selectionValue: EuiTableSelectionType<T> = {
    onSelectionChange: (selected: T[]) => setSelection(selected)
  }

  const handleResetSelection = () => {
    tableRef.current?.setSelection([])
  }

  const handleDelete = () => {
    onDelete(selection)
  }

  const handleExport = (instances: T[], withSecrets: boolean) => {
    onExport?.(instances, withSecrets)
    tableRef.current?.setSelection([])
  }

  const toggleSelectedRow = (instance: T) => ({
    className: cx({
      'euiTableRow-isSelected': instance?.id === editedInstance?.id
    })
  })

  const actionMsg = (action: string) => `
    Selected
    ${' '}
    ${selection.length}
    ${' '}
    items will be ${action} from
    RedisInsight:
  `

  return (
    <div className="itemList" ref={containerTableRef}>
      <EuiInMemoryTable
        ref={tableRef}
        items={instances.filter(({ visible = true }) => visible)}
        itemId="id"
        loading={loading}
        message={message}
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
            !hideExport ? <ExportAction<T> selection={selection} onExport={handleExport} subTitle={actionMsg('exported')} /> : null,
            <DeleteAction<T>
              selection={selection}
              onDelete={handleDelete}
              subTitle={actionMsg('deleted')}
            />
          ]}
          width={width}
        />
      )}
    </div>
  )
}

export default ItemList
