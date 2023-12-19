import {
  Criteria,
  EuiBasicTableColumn,
  EuiInMemoryTable,
  EuiTableSelectionType,
  PropertySort,
} from '@elastic/eui'
import cx from 'classnames'
import { first, last } from 'lodash'
import React, { useEffect, useRef, useState } from 'react'
import { Maybe, Nullable } from 'uiSrc/utils'

import { ActionBar, DeleteAction, ExportAction } from './components'

import './styles.scss'
import styles from './styles.module.scss'

export interface Props<T> {
  width: number
  dialogIsOpen: boolean
  editedInstance: Nullable<T>
  columnVariations: EuiBasicTableColumn<T>[][]
  onDelete: (ids: T[]) => void
  onExport: (ids: T[], withSecrets: boolean) => void
  onWheel: () => void
  loading: boolean
  data: T[]
  onTableChange: ({ sort, page }: Criteria<T>) => void
  sort: PropertySort
}

const columnsHideWidth = 950

function ItemList<T extends { id: string; name?: string; visible?: boolean }>({
  width,
  dialogIsOpen,
  columnVariations,
  onDelete,
  onExport,
  onWheel,
  editedInstance,
  loading,
  data: instances,
  onTableChange,
  sort
}: Props<T>) {
  const [columns, setColumns] = useState(first(columnVariations))
  const [selection, setSelection] = useState<T[]>([])
  const [message, setMessage] = useState<Maybe<string | JSX.Element>>(undefined)

  const tableRef = useRef<EuiInMemoryTable<T>>(null)
  const containerTableRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerTableRef.current) {
      const { offsetWidth } = containerTableRef.current

      if (dialogIsOpen) {
        setColumns(columnVariations[1])
        return
      }

      if (offsetWidth < columnsHideWidth && columns?.length !== last(columnVariations)?.length) {
        setColumns(last(columnVariations))
        return
      }

      if (offsetWidth > columnsHideWidth && columns?.length !== first(columnVariations)?.length) {
        setColumns(first(columnVariations))
      }
    }
  }, [width])

  useEffect(() => {
    if (loading) {
      setMessage('loading...')
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
    onExport(instances, withSecrets)
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
            <ExportAction<T> selection={selection} onExport={handleExport} subTitle={actionMsg('exported')} />,
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
