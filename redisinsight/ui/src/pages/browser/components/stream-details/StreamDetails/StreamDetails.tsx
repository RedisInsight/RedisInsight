import React, { useState, useEffect, useContext } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { last } from 'lodash'
import cx from 'classnames'
import { EuiButtonIcon } from '@elastic/eui'

import {
  fetchMoreStreamEntries,
  fetchStreamEntries,
  streamDataSelector,
  streamSelector,
} from 'uiSrc/slices/browser/stream'
import VirtualTable from 'uiSrc/components/virtual-table/VirtualTable'
import { ITableColumn } from 'uiSrc/components/virtual-table/interfaces'
import { NoResultsFoundText } from 'uiSrc/constants/texts'
import { selectedKeyDataSelector } from 'uiSrc/slices/browser/keys'
import { SCAN_COUNT_DEFAULT } from 'uiSrc/constants/api'
import { SortOrder } from 'uiSrc/constants'
import StreamMinRangeContext from 'uiSrc/contexts/streamMinRangeContext'
import StreamMaxRangeContext from 'uiSrc/contexts/streamMaxRangeContext'
import { StreamEntryDto } from 'apiSrc/modules/browser/dto/stream.dto'
import StreamRangeFilter from './StreamRangeFilter'

import styles from './styles.module.scss'

const headerHeight = 60
const rowHeight = 54
const actionsWidth = 54
const minColumnWidth = 190
const xrangeIdPrefix = '('

interface IStreamEntry extends StreamEntryDto {
  editing: boolean
}

export interface Props {
  data: IStreamEntry[]
  columns: ITableColumn[]
  onEditEntry: (entryId:string, editing: boolean) => void
  onClosePopover: () => void
  isFooterOpen?: boolean
}

const StreamDetails = (props: Props) => {
  const { data: entries = [], columns = [], onClosePopover, isFooterOpen } = props
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

  const [minVal] = useContext(StreamMinRangeContext)
  const [maxVal] = useContext(StreamMaxRangeContext)

  const loadMoreItems = () => {
    const lastLoadedEntryId = last(entries)?.id ?? ''
    const lastEntryId = sortedColumnOrder === SortOrder.ASC ? lastEntry?.id : firstEntry?.id

    if (lastLoadedEntryId && lastLoadedEntryId !== lastEntryId) {
      // dispatch(
      //   fetchMoreStreamEntries(
      //     key,
      //     `${xrangeIdPrefix + lastLoadedEntryId}`,
      //     SCAN_COUNT_DEFAULT,
      //     sortedColumnOrder,
      //   )
      // )
    }
  }

  const onChangeSorting = (column: any, order: SortOrder) => {
    setSortedColumnName(column)
    setSortedColumnOrder(order)

    dispatch(fetchStreamEntries(key, SCAN_COUNT_DEFAULT, minVal, maxVal, order))
  }

  return (
    <>
      {firstEntry.id !== '' && lastEntry.id !== '' && (
      <StreamRangeFilter
        sortedColumnOrder={sortedColumnOrder}
        min={firstEntry.id}
        max={lastEntry.id}
      />
      )}
      <div
        className={cx(
          'key-details-table',
          'stream-entries-container',
          styles.container,
          { footerOpened: isFooterOpen }
        )}
      >
        <div className={styles.columnManager}>
          <EuiButtonIcon iconType="boxesVertical" aria-label="manage columns" />
        </div>
        <VirtualTable
          selectable={false}
          keyName={key}
          headerHeight={headerHeight}
          rowHeight={rowHeight}
          columns={columns}
          footerHeight={0}
          loadMoreItems={loadMoreItems}
          loading={loading}
          items={entries}
          totalItemsCount={total}
          noItemsMessage={NoResultsFoundText}
          onWheel={onClosePopover}
          onChangeSorting={onChangeSorting}
          tableWidth={columns.length * minColumnWidth - actionsWidth}
          sortedColumn={{
            column: sortedColumnName,
            order: sortedColumnOrder,
          }}
        />
      </div>
    </>
  )
}

export default StreamDetails
