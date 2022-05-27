import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { isNull } from 'lodash'
import cx from 'classnames'

import {
  fetchStreamEntries,
  streamDataSelector,
  streamSelector,
} from 'uiSrc/slices/browser/stream'
import VirtualTable from 'uiSrc/components/virtual-table/VirtualTable'
import { ITableColumn } from 'uiSrc/components/virtual-table/interfaces'
import { selectedKeyDataSelector } from 'uiSrc/slices/browser/keys'
import { SCAN_COUNT_DEFAULT } from 'uiSrc/constants/api'
import { SortOrder } from 'uiSrc/constants'
import { StreamEntryDto } from 'apiSrc/modules/browser/dto/stream.dto'

import styles from './styles.module.scss'

const headerHeight = 60
const rowHeight = 54
const actionsWidth = 54
const minColumnWidth = 190
const noItemsMessageInEmptyStream = 'There are no Entries in the Stream.'
const noItemsMessageInRange = 'No results found.'

interface IStreamEntry extends StreamEntryDto {
  editing: boolean
}

export interface Props {
  data: IStreamEntry[]
  columns: ITableColumn[]
  onEditEntry: (entryId:string, editing: boolean) => void
  onClosePopover: () => void
  loadMoreItems: () => void
  isFooterOpen?: boolean
}

const StreamDataView = (props: Props) => {
  const { data: entries = [], columns = [], onClosePopover, loadMoreItems, isFooterOpen } = props
  const dispatch = useDispatch()

  const { loading } = useSelector(streamSelector)
  const {
    total,
    firstEntry,
    lastEntry,
  } = useSelector(streamDataSelector)
  const { name: key } = useSelector(selectedKeyDataSelector) ?? { name: '' }

  const [sortedColumnName, setSortedColumnName] = useState<string>('id')
  const [sortedColumnOrder, setSortedColumnOrder] = useState<SortOrder>(SortOrder.DESC)

  const onChangeSorting = (column: any, order: SortOrder) => {
    setSortedColumnName(column)
    setSortedColumnOrder(order)

    dispatch(fetchStreamEntries(key, SCAN_COUNT_DEFAULT, order, false))
  }

  return (
    <>

      <div
        className={cx(
          'key-details-table',
          'stream-details-table',
          styles.container,
          { footerOpened: isFooterOpen }
        )}
        data-testid="stream-entries-container"
      >
        {/* <div className={styles.columnManager}>
          <EuiButtonIcon iconType="boxesVertical" aria-label="manage columns" />
        </div> */}
        <VirtualTable
          hideProgress
          selectable={false}
          keyName={key}
          headerHeight={entries?.length ? headerHeight : 0}
          rowHeight={rowHeight}
          columns={columns}
          footerHeight={0}
          loadMoreItems={loadMoreItems}
          loading={loading}
          items={entries}
          totalItemsCount={total}
          onWheel={onClosePopover}
          onChangeSorting={onChangeSorting}
          noItemsMessage={isNull(firstEntry) && isNull(lastEntry) ? noItemsMessageInEmptyStream : noItemsMessageInRange}
          tableWidth={columns.length * minColumnWidth - actionsWidth}
          sortedColumn={entries?.length ? {
            column: sortedColumnName,
            order: sortedColumnOrder,
          } : undefined}
        />
      </div>
    </>
  )
}

export default StreamDataView
