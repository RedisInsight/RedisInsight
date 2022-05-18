import React, { useState, useContext } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { last } from 'lodash'
import cx from 'classnames'
import { EuiButtonIcon, EuiProgress } from '@elastic/eui'

import {
  fetchMoreStreamEntries,
  fetchStreamEntries,
  streamDataSelector,
  streamSelector,
} from 'uiSrc/slices/browser/stream'
import VirtualTable from 'uiSrc/components/virtual-table/VirtualTable'
import { ITableColumn } from 'uiSrc/components/virtual-table/interfaces'
import { selectedKeyDataSelector } from 'uiSrc/slices/browser/keys'
import { SCAN_COUNT_DEFAULT, SCAN_STREAM_START_DEFAULT, SCAN_STREAM_END_DEFAULT } from 'uiSrc/constants/api'
import { SortOrder } from 'uiSrc/constants'
import { getTimestampFromId } from 'uiSrc/utils/streamUtils'
import StreamRangeStartContext from 'uiSrc/contexts/streamRangeStartContext'
import StreamRangeEndContext from 'uiSrc/contexts/streamRangeEndContext'
import { StreamEntryDto } from 'apiSrc/modules/browser/dto/stream.dto'
import StreamRangeFilter from './StreamRangeFilter'

import styles from './styles.module.scss'

const headerHeight = 60
const rowHeight = 54
const actionsWidth = 54
const minColumnWidth = 190
const xrangeIdPrefix = '('
const noItemsMessageString = 'There are no Entries in the Stream.'

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

  const { startVal } = useContext(StreamRangeStartContext)
  const { endVal } = useContext(StreamRangeEndContext)

  const loadMoreItems = () => {
    const lastLoadedEntryId = last(entries)?.id
    const lastLoadedEntryTimeStamp = getTimestampFromId(lastLoadedEntryId)

    const lastRangeEntryTimestamp = endVal ? endVal.toString() : getTimestampFromId(lastEntry?.id)
    const firstRangeEntryTimestamp = startVal ? startVal.toString() : getTimestampFromId(firstEntry?.id)
    const shouldLoadMore = () => {
      if (!lastLoadedEntryTimeStamp) {
        return false
      }
      return sortedColumnOrder === SortOrder.ASC
        ? lastLoadedEntryTimeStamp > lastRangeEntryTimestamp
        : lastLoadedEntryTimeStamp < firstRangeEntryTimestamp
    }

    if (shouldLoadMore()) {
      dispatch(
        fetchMoreStreamEntries(
          key,
          sortedColumnOrder === SortOrder.DESC ? startVal!.toString() : `${xrangeIdPrefix + lastLoadedEntryId}`,
          sortedColumnOrder === SortOrder.DESC ? `${xrangeIdPrefix + lastLoadedEntryId}` : endVal!.toString(),
          SCAN_COUNT_DEFAULT,
          sortedColumnOrder,
        )
      )
    }
  }

  const onChangeSorting = (column: any, order: SortOrder) => {
    setSortedColumnName(column)
    setSortedColumnOrder(order)

    if (startVal && endVal) {
      const firstEntryTimeStamp: number = getTimestampFromId(firstEntry?.id)
      const lastEntryTimeStamp: number = getTimestampFromId(lastEntry?.id)
      const lastEntryFilter = endVal === lastEntryTimeStamp ? SCAN_STREAM_END_DEFAULT : endVal.toString()
      const firstEntryFilter = startVal === firstEntryTimeStamp ? SCAN_STREAM_START_DEFAULT : startVal.toString()
      dispatch(fetchStreamEntries(key, SCAN_COUNT_DEFAULT, firstEntryFilter, lastEntryFilter, order))
    } else {
      dispatch(fetchStreamEntries(key, SCAN_COUNT_DEFAULT, SCAN_STREAM_START_DEFAULT, SCAN_STREAM_START_DEFAULT, order))
    }
  }

  return (
    <>
      {(firstEntry !== null && lastEntry !== null) ? (
        <StreamRangeFilter
          sortedColumnOrder={sortedColumnOrder}
          min={firstEntry.id}
          max={lastEntry.id}
        />
      )
        : (
          <div className={styles.rangeWrapper}>
            <div style={{ left: '30px', width: 'calc(100% - 56px)' }} className={styles.sliderTrack} />
          </div>
        )}
      <div
        className={cx(
          'key-details-table',
          'stream-entries-container',
          styles.container,
          { footerOpened: isFooterOpen }
        )}
        data-test-id="stream-entries-container"
      >
        {loading && (
          <EuiProgress
            color="primary"
            size="xs"
            position="absolute"
            data-testid="progress-key-stream"
          />
        )}
        <div className={styles.columnManager}>
          <EuiButtonIcon iconType="boxesVertical" aria-label="manage columns" />
        </div>
        <VirtualTable
          hideProgress
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
          onWheel={onClosePopover}
          onChangeSorting={onChangeSorting}
          noItemsMessage={noItemsMessageString}
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
