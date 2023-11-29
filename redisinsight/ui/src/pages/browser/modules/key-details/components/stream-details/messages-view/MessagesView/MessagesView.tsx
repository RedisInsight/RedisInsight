import React from 'react'
import { useSelector } from 'react-redux'
import cx from 'classnames'

import {
  streamGroupsSelector,
} from 'uiSrc/slices/browser/stream'
import VirtualTable from 'uiSrc/components/virtual-table/VirtualTable'
import { ITableColumn } from 'uiSrc/components/virtual-table/interfaces'
import { selectedKeyDataSelector } from 'uiSrc/slices/browser/keys'
import { PendingEntryDto } from 'apiSrc/modules/browser/stream/dto'

import styles from './styles.module.scss'

const headerHeight = 60
const rowHeight = 54

const noItemsMessageString = 'Your Consumer has no pending messages.'

export interface Props {
  data: PendingEntryDto[]
  columns: ITableColumn[]
  total: number
  onClosePopover: () => void
  loadMoreItems: () => void
  isFooterOpen?: boolean
}

const MessagesView = (props: Props) => {
  const { data = [], columns = [], total, onClosePopover, loadMoreItems, isFooterOpen } = props

  const { loading, } = useSelector(streamGroupsSelector)
  const { name: key = '' } = useSelector(selectedKeyDataSelector) ?? { }

  return (
    <>
      <div
        className={cx(
          'key-details-table',
          'stream-details-table',
          styles.container,
          { footerOpened: isFooterOpen }
        )}
        data-testid="stream-messages-container"
      >
        <VirtualTable
          hideProgress
          selectable={false}
          keyName={key}
          totalItemsCount={total}
          headerHeight={data?.length ? headerHeight : 0}
          rowHeight={rowHeight}
          columns={columns}
          footerHeight={0}
          loading={loading}
          items={data}
          tableWidth={columns.reduce((a, b) => a + (b.minWidth ?? 0), 0)}
          onWheel={onClosePopover}
          loadMoreItems={loadMoreItems}
          noItemsMessage={noItemsMessageString}
        />
      </div>
    </>
  )
}

export default MessagesView
