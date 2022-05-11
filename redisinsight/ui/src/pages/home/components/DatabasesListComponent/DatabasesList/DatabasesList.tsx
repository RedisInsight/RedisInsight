import {
  Direction,
  Criteria,
  EuiBasicTableColumn,
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiInMemoryTable,
  EuiPopover,
  EuiTableSelectionType,
  EuiText,
  PropertySort,
} from '@elastic/eui'
import cx from 'classnames'
import { first, last } from 'lodash'
import React, { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { ActionBar } from 'uiSrc/components'
import { instancesSelector } from 'uiSrc/slices/instances/instances'
import { Instance } from 'uiSrc/slices/interfaces'
import { formatLongName, Nullable } from 'uiSrc/utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import styles from '../styles.module.scss'

export interface Props {
  width: number;
  dialogIsOpen: boolean;
  editedInstance: Nullable<Instance>;
  columnVariations: EuiBasicTableColumn<Instance>[][];
  onDelete: (ids: Instance[]) => void;
  onWheel: () => void;
}

const columnsHideWidth = 950
const loadingMsg = 'loading...'

function DatabasesList({
  width,
  dialogIsOpen,
  columnVariations,
  onDelete,
  onWheel,
  editedInstance,
}: Props) {
  const [columns, setColumns] = useState(first(columnVariations))
  const [selection, setSelection] = useState<Instance[]>([])
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const { loading, data: instances } = useSelector(instancesSelector)

  const tableRef = useRef<EuiInMemoryTable<Instance>>(null)
  const containerTableRef = useRef<HTMLDivElement>(null)
  const deleteSelectionListRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerTableRef.current) {
      const { offsetWidth } = containerTableRef.current

      if (dialogIsOpen && columns.length !== columnVariations[1]) {
        setColumns(columnVariations[1])
        return
      }

      if (
        offsetWidth < columnsHideWidth
        && columns.length !== last(columnVariations)
      ) {
        setColumns(last(columnVariations))
        return
      }

      if (
        offsetWidth > columnsHideWidth
        && columns.length !== first(columnVariations)
      ) {
        setColumns(first(columnVariations))
      }
    }
  }, [width])

  const sort: PropertySort = {
    field: 'lastConnection',
    direction: 'asc',
  }

  const selectionValue: EuiTableSelectionType<Instance> = {
    onSelectionChange: (selected: Instance[]) => setSelection(selected),
  }

  const handleResetSelection = () => {
    tableRef.current?.setSelection([])
  }

  const onButtonClick = () => {
    sendEventTelemetry({
      event: TelemetryEvent.CONFIG_DATABASES_MULTIPLE_DATABASES_DELETE_CLICKED,
      eventData: {
        databasesIds: selection.map((selected: Instance) => selected.id)
      }
    })
    setIsPopoverOpen((prevState) => !prevState)
  }

  const closePopover = () => {
    setIsPopoverOpen(false)
  }

  const toggleSelectedRow = (instance: Instance) => ({
    className: cx({
      'euiTableRow-isSelected': instance?.id === editedInstance?.id,
    }),
  })

  const onTableChange = ({ sort, page }: Criteria<Instance>) => {
    // calls also with page changing
    if (sort && !page) {
      sendEventSortedTelemetry(sort)
    }
  }

  const sendEventSortedTelemetry = (sort: { field: keyof Instance; direction: Direction }) =>
    sendEventTelemetry({
      event: TelemetryEvent.CONFIG_DATABASES_DATABASE_LIST_SORTED,
      eventData: sort
    })

  const deleteBtn = (
    <EuiButton
      onClick={onButtonClick}
      fill
      color="secondary"
      size="s"
      iconType="trash"
      className={styles.actionDeleteBtn}
    >
      Delete
    </EuiButton>
  )

  const PopoverDelete = (
    <EuiPopover
      id="deletePopover"
      ownFocus
      button={deleteBtn}
      isOpen={isPopoverOpen}
      closePopover={closePopover}
      panelPaddingSize="l"
    >
      <EuiText size="m">
        <p className={styles.popoverSubTitle}>
          Selected
          {' '}
          {selection.length}
          {' '}
          databases will be deleted from
          RedisInsight Databases:
        </p>
      </EuiText>
      <div
        className={styles.deleteBoxSection}
        id="test"
        ref={deleteSelectionListRef}
      >
        {selection.map((select: Instance) => (
          <EuiFlexGroup
            key={select.id}
            gutterSize="s"
            responsive={false}
            className={styles.deleteNameList}
          >
            <EuiFlexItem grow={false}>
              <EuiIcon type="check" />
            </EuiFlexItem>
            <EuiFlexItem className={styles.deleteNameListText}>
              <span>{formatLongName(select.name)}</span>
            </EuiFlexItem>
          </EuiFlexGroup>
        ))}
      </div>
      <div className={styles.popoverFooter}>
        <EuiButton
          fill
          size="s"
          color="warning"
          iconType="trash"
          onClick={() => {
            closePopover()
            onDelete(selection)
          }}
          className={styles.popoverDeleteBtn}
          data-testid="delete-selected-dbs"
        >
          Delete
        </EuiButton>
      </div>
    </EuiPopover>
  )

  return (
    <div className="databaseList" ref={containerTableRef}>
      <EuiInMemoryTable
        ref={tableRef}
        items={instances}
        itemId="id"
        loading={loading}
        message={loadingMsg}
        columns={columns}
        rowProps={toggleSelectedRow}
        sorting={{ sort }}
        selection={selectionValue}
        onWheel={onWheel}
        onTableChange={onTableChange}
        isSelectable
      />

      {selection.length > 1 && (
        <ActionBar
          selectionCount={selection.length}
          onCloseActionBar={handleResetSelection}
          actions={PopoverDelete}
          width={width}
        />
      )}
    </div>
  )
}

export default DatabasesList
