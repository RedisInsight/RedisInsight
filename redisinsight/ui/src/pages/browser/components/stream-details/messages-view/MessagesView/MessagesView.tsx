import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import cx from 'classnames'
import { orderBy } from 'lodash'

import {
  streamGroupsSelector,
} from 'uiSrc/slices/browser/stream'
import VirtualTable from 'uiSrc/components/virtual-table/VirtualTable'
import { ITableColumn } from 'uiSrc/components/virtual-table/interfaces'
import { selectedKeyDataSelector } from 'uiSrc/slices/browser/keys'
import { SortOrder } from 'uiSrc/constants'
import { PendingEntryDto } from 'apiSrc/modules/browser/dto/stream.dto'

import styles from './styles.module.scss'

const headerHeight = 60
const rowHeight = 54

const noItemsMessageString = 'There are no Messages in the Consumer Group.'

export interface Props {
  data: PendingEntryDto[]
  columns: ITableColumn[]
  onClosePopover: () => void
  isFooterOpen?: boolean
}

const MessagesView = (props: Props) => {
  const { data = [], columns = [], onClosePopover, isFooterOpen } = props

  const { loading } = useSelector(streamGroupsSelector)
  const { name: key = '' } = useSelector(selectedKeyDataSelector) ?? { }

  const [messages, setMessages] = useState(data)
  const [sortedColumnName, setSortedColumnName] = useState<string>('id')
  const [sortedColumnOrder, setSortedColumnOrder] = useState<SortOrder>(SortOrder.ASC)

  useEffect(() => {
    setMessages(orderBy(data, sortedColumnName, sortedColumnOrder?.toLowerCase()))
  }, [data])

  const onChangeSorting = (column: any, order: SortOrder) => {
    setSortedColumnName(column)
    setSortedColumnOrder(order)

    setMessages(orderBy(messages, column, order?.toLowerCase()))
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
        data-testid="stream-messages-container"
      >
        <VirtualTable
          hideProgress
          selectable={false}
          keyName={key}
          totalItemsCount={data.length}
          headerHeight={messages?.length ? headerHeight : 0}
          rowHeight={rowHeight}
          columns={columns}
          footerHeight={0}
          loading={loading}
          items={messages}
          onWheel={onClosePopover}
          onChangeSorting={onChangeSorting}
          noItemsMessage={noItemsMessageString}
          sortedColumn={messages?.length ? {
            column: sortedColumnName,
            order: sortedColumnOrder,
          } : undefined}
        />
      </div>
    </>
  )
}

export default MessagesView
